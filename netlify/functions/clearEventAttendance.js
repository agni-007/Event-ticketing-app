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
    const { eventTitle } = JSON.parse(event.body);
    if (!eventTitle) return { statusCode: 400, body: JSON.stringify({ error: 'Missing eventTitle' }) };

    connection = await getDbConnection();

    // Get the event id from title
    const [events] = await connection.query(`SELECT id FROM events WHERE title = ?`, [eventTitle]);
    if (events.length === 0) return { statusCode: 404, body: JSON.stringify({ error: 'Event not found' }) };

    const eventId = events[0].id;
    // Reset attended flag to false for all attendees of this event
    await connection.query(`UPDATE registrations SET attended = false WHERE event_id = ? AND attended = true`, [eventId]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: error.message.includes('Unauthorized') ? 401 : 500,
      body: JSON.stringify({ error: error.message || 'Failed to clear attendance' })
    };
  } finally {
    if (connection) connection.release();
  }
};
