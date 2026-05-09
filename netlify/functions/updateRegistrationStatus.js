import { getDbConnection } from './db.js';
import jwt from 'jsonwebtoken';

const verifyAdminAuth = (event) => {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  if (!decoded.username) {
    throw new Error('Unauthorized Admin');
  }
  return decoded;
};

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let connection;
  try {
    verifyAdminAuth(event);
    const { regId, status } = JSON.parse(event.body);

    if (!regId || !['approved', 'declined'].includes(status)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid input' }) };
    }

    connection = await getDbConnection();
    await connection.query(`UPDATE registrations SET status = ? WHERE id = ?`, [status, regId]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Update status error:', error);
    return { 
      statusCode: error.message.includes('Unauthorized') ? 401 : 500, 
      body: JSON.stringify({ error: error.message || 'Failed to update status' }) 
    };
  } finally {
    if (connection) connection.release();
  }
};
