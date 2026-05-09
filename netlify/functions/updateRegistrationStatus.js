import { getDbConnection, corsHeaders, handleOptions } from './db.js';
import jwt from 'jsonwebtoken';

const verifyAdminAuth = (event) => {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Unauthorized');
  const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'secret');
  if (!decoded.username) throw new Error('Unauthorized');
  return decoded;
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  let connection;
  try {
    verifyAdminAuth(event);
    const { regId, status } = JSON.parse(event.body);

    if (!regId || !['approved', 'declined'].includes(status)) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid input' }) };
    }

    connection = await getDbConnection();
    await connection.query(`UPDATE registrations SET status = ? WHERE id = ?`, [status, regId]);

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return {
      statusCode: error.message === 'Unauthorized' ? 401 : 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Failed to update status' })
    };
  } finally {
    if (connection) connection.release();
  }
};
