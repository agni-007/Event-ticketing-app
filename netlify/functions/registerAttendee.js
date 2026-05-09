import { getDbConnection, corsHeaders, handleOptions } from './db.js';
import jwt from 'jsonwebtoken';

const verifyAuth = (event) => {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Unauthorized');
  return jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'secret');
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  let connection;
  try {
    const user = verifyAuth(event);
    const { eventId, fullName, email, phone } = JSON.parse(event.body);

    if (!eventId || !fullName || !email) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    connection = await getDbConnection();

    // Check event exists
    const [events] = await connection.query(`SELECT id FROM events WHERE id = ? AND is_active = true`, [eventId]);
    if (events.length === 0) {
      return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: 'Event not found or inactive' }) };
    }

    // Prevent duplicate registration for same user+event
    const [existing] = await connection.query(
      `SELECT id FROM registrations WHERE user_id = ? AND event_id = ?`,
      [user.id, eventId]
    );
    if (existing.length > 0) {
      return { statusCode: 409, headers: corsHeaders, body: JSON.stringify({ error: 'You have already registered for this event.' }) };
    }

    const clientId = 'CLT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const regId = 'REG-' + Date.now() + '-' + Math.floor(Math.random() * 9000 + 1000);
    const qrData = JSON.stringify({ regId, clientId, eventId, name: fullName });

    await connection.query(
      `INSERT INTO registrations (event_id, user_id, full_name, email, phone, client_id, reg_id, qr_data, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [eventId, user.id, fullName, email, phone || '', clientId, regId, qrData]
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Registration submitted! Pending admin approval.' })
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return { statusCode: 409, headers: corsHeaders, body: JSON.stringify({ error: 'Duplicate registration detected.' }) };
    }
    return {
      statusCode: error.message === 'Unauthorized' ? 401 : 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Failed to register' })
    };
  } finally {
    if (connection) connection.release();
  }
};
