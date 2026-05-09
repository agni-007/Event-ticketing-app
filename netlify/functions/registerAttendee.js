import { getDbConnection } from './db.js';

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let connection;
  try {
    const data = JSON.parse(event.body);
    const { eventId, fullName, email, phone } = data;

    if (!eventId || !fullName || !email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const clientId = 'CLT-' + Math.random().toString(36).substring(2,8).toUpperCase();
    const regId = 'REG-' + Date.now() + '-' + Math.floor(Math.random()*1000);
    const qrData = JSON.stringify({ regId, clientId, eventId, name: fullName });

    connection = await getDbConnection();
    
    // Check if event exists
    const [events] = await connection.query(`SELECT id FROM events WHERE id = ?`, [eventId]);
    if (events.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Event not found' }) };
    }

    await connection.query(`
      INSERT INTO registrations (event_id, full_name, email, phone, client_id, reg_id, qr_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [eventId, fullName, email, phone || '', clientId, regId, qrData]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, regId, qrData })
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to register' }) };
  } finally {
    if (connection) connection.release();
  }
};
