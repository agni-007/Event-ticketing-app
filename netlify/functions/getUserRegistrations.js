import { getDbConnection, corsHeaders, handleOptions } from './db.js';
import jwt from 'jsonwebtoken';

const verifyAuth = (event) => {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Unauthorized');
  return jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'secret');
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  let connection;
  try {
    const user = verifyAuth(event);
    connection = await getDbConnection();
    const [rows] = await connection.query(`
      SELECT r.id, r.event_id, r.status, r.attended, r.client_id, r.reg_id, r.qr_data, r.created_at,
             e.title AS event_title, e.date, e.venue
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [user.id]);

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(rows) };
  } catch (error) {
    return {
      statusCode: error.message === 'Unauthorized' ? 401 : 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Failed to fetch registrations' })
    };
  } finally {
    if (connection) connection.release();
  }
};
