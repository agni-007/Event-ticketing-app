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
    const { eventTitle } = JSON.parse(event.body);
    if (!eventTitle) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing eventTitle' }) };

    connection = await getDbConnection();

    // Get the event id from title
    const [events] = await connection.query(`SELECT id FROM events WHERE title = ?`, [eventTitle]);
    if (events.length === 0) return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: 'Event not found' }) };

    const eventId = events[0].id;
    // Reset attended flag to false for all attendees of this event
    await connection.query(`UPDATE registrations SET attended = false WHERE event_id = ? AND attended = true`, [eventId]);

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return {
      statusCode: error.message === 'Unauthorized' ? 401 : 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Failed to clear attendance' })
    };
  } finally {
    if (connection) connection.release();
  }
};
