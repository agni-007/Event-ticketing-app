import { getDbConnection } from './db.js';

export const handler = async (event, context) => {
  // Allow only GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.query(`
      SELECT * FROM events WHERE is_active = true ORDER BY date ASC
    `);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows)
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch events' })
    };
  } finally {
    if (connection) connection.release();
  }
};
