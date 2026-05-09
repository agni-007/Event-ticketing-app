import { getDbConnection } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let connection;
  try {
    const { email, password } = JSON.parse(event.body);
    
    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email and password required' }) };
    }

    connection = await getDbConnection();
    
    // Check if user exists
    const [existing] = await connection.query(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing.length > 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'User already exists' }) };
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await connection.query(`INSERT INTO users (email, password_hash) VALUES (?, ?)`, [email, hash]);

    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Signup failed' }) };
  } finally {
    if (connection) connection.release();
  }
};
