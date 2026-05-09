import { getDbConnection } from './db.js';
import jwt from 'jsonwebtoken';

const verifyAuth = (event) => {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET || 'secret');
};

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let connection;
  try {
    const user = verifyAuth(event);
    
    const data = JSON.parse(event.body);
    const { eventId, fullName, email, phone } = data;

    if (!eventId || !fullName || !email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const clientId = 'CLT-' + Math.random().toString(36).substring(2,8).toUpperCase();
    const regId = 'REG-' + Date.now() + '-' + Math.floor(Math.random()*1000);
    const qrData = JSON.stringify({ regId, clientId, eventId, name: fullName });

    connection = await getDbConnection();
    
    const [events] = await connection.query(`SELECT id FROM events WHERE id = ?`, [eventId]);
    if (events.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Event not found' }) };
    }

    await connection.query(`
      INSERT INTO registrations (event_id, user_id, full_name, email, phone, client_id, reg_id, qr_data, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [eventId, user.id, fullName, email, phone || '', clientId, regId, qrData]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Registration submitted! Pending admin approval." })
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      statusCode: error.message === 'Unauthorized' ? 401 : 500, 
      body: JSON.stringify({ error: error.message || 'Failed to register' }) 
    };
  } finally {
    if (connection) connection.release();
  }
};
