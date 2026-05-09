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

    const { regId } = JSON.parse(event.body);
    if (!regId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing registration ID' }) };
    }

    connection = await getDbConnection();
    
    const [regs] = await connection.query(`SELECT * FROM registrations WHERE reg_id = ?`, [regId]);
    if (regs.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Registration not found' }) };
    }

    const reg = regs[0];
    if (reg.attended) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Attendee already verified' }) };
    }

    await connection.query(`UPDATE registrations SET attended = true WHERE id = ?`, [reg.id]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, name: reg.full_name })
    };
  } catch (error) {
    console.error('Error verifying attendee:', error);
    return { 
      statusCode: error.message === 'Unauthorized' ? 401 : 500, 
      body: JSON.stringify({ error: error.message || 'Failed to verify attendee' }) 
    };
  } finally {
    if (connection) connection.release();
  }
};
