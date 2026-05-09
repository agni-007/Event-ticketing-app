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
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };

  let connection;
  try {
    const user = verifyAuth(event);

    connection = await getDbConnection();
    const [rows] = await connection.query(`
      SELECT r.id, r.event_id, r.status, r.client_id, r.reg_id, r.qr_data, e.title as event_title, e.date
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [user.id]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows)
    };
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    return { 
      statusCode: error.message === 'Unauthorized' ? 401 : 500, 
      body: JSON.stringify({ error: error.message || 'Failed to fetch registrations' }) 
    };
  } finally {
    if (connection) connection.release();
  }
};
