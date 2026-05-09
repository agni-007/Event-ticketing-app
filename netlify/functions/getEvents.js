import { getDbConnection, corsHeaders, handleOptions } from './db.js';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.query(
      `SELECT id, title, description, date, venue, image_url FROM events WHERE is_active = true ORDER BY date ASC`
    );
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(rows) };
  } catch (error) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Failed to fetch events' }) };
  } finally {
    if (connection) connection.release();
  }
};
