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
    const { title, description, date, venue, image_url } = JSON.parse(event.body);
    if (!title || !date || !venue) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Title, date, and venue are required' }) };
    }

    connection = await getDbConnection();
    const [result] = await connection.query(
      `INSERT INTO events (title, description, date, venue, image_url, is_active) VALUES (?, ?, ?, ?, ?, true)`,
      [title, description || '', date, venue, image_url || '']
    );

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ id: result.insertId, title, date, venue }) };
  } catch (error) {
    return {
      statusCode: error.message === 'Unauthorized' ? 401 : 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Failed to add event' })
    };
  } finally {
    if (connection) connection.release();
  }
};
