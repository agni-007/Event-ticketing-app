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
    const { eventId } = JSON.parse(event.body);
    if (!eventId) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing eventId' }) };

    connection = await getDbConnection();
    // Soft delete — set is_active = false to preserve registration history
    await connection.query(`UPDATE events SET is_active = false WHERE id = ?`, [eventId]);

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return {
      statusCode: error.message === 'Unauthorized' ? 401 : 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Failed to delete event' })
    };
  } finally {
    if (connection) connection.release();
  }
};
