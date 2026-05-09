import { getDbConnection } from './db.js';
import jwt from 'jsonwebtoken';

const verifyAuth = (event) => {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET || 'secret');
};

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let connection;
  try {
    verifyAuth(event);

    const { id } = JSON.parse(event.body);
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing event ID' }) };
    }

    connection = await getDbConnection();
    
    // Check if registrations exist
    const [regs] = await connection.query(`SELECT id FROM registrations WHERE event_id = ?`, [id]);
    if (regs.length > 0) {
      // First delete registrations
      await connection.query(`DELETE FROM registrations WHERE event_id = ?`, [id]);
    }

    await connection.query(`DELETE FROM events WHERE id = ?`, [id]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { 
      statusCode: error.message === 'Unauthorized' ? 401 : 500, 
      body: JSON.stringify({ error: error.message || 'Failed to delete event' }) 
    };
  } finally {
    if (connection) connection.release();
  }
};
