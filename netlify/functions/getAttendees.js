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
    verifyAuth(event);
    connection = await getDbConnection();

    const [rows] = await connection.query(`
      SELECT r.id, r.full_name, r.email, r.reg_id, e.title AS event_title, e.venue
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.attended = true
      ORDER BY r.created_at DESC
    `);

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(rows) };
  } catch (error) {
    return {
      statusCode: error.message === 'Unauthorized' ? 401 : 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Failed to fetch attendees' })
    };
  } finally {
    if (connection) connection.release();
  }
};
