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
    verifyAuth(event);

    const { title, description, date, venue, image_url } = JSON.parse(event.body);
    if (!title || !description || !date || !venue) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    connection = await getDbConnection();
    const formattedDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    
    await connection.query(`
      INSERT INTO events (title, description, date, venue, image_url)
      VALUES (?, ?, ?, ?, ?)
    `, [title, description, formattedDate, venue, image_url || '']);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error adding event:', error);
    return { 
      statusCode: error.message === 'Unauthorized' ? 401 : 500, 
      body: JSON.stringify({ error: error.message || 'Failed to add event' }) 
    };
  } finally {
    if (connection) connection.release();
  }
};
