import { getDbConnection } from './db.js';
import jwt from 'jsonwebtoken';

const verifyAdminAuth = (event) => {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Unauthorized');
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  if (!decoded.username) throw new Error('Unauthorized');
  return decoded;
};

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let connection;
  try {
    verifyAdminAuth(event);
    const { regId } = JSON.parse(event.body);
    if (!regId) return { statusCode: 400, body: JSON.stringify({ error: 'Missing regId' }) };

    connection = await getDbConnection();
    await connection.query(`DELETE FROM registrations WHERE id = ?`, [regId]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: error.message.includes('Unauthorized') ? 401 : 500,
      body: JSON.stringify({ error: error.message || 'Failed to delete' })
    };
  } finally {
    if (connection) connection.release();
  }
};
