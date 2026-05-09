import { getDbConnection, corsHeaders, handleOptions } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  let connection;
  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Email and password required' }) };
    }

    connection = await getDbConnection();

    // Check if user exists
    const [existing] = await connection.query(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing.length > 0) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'User already exists' }) };
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await connection.query(`INSERT INTO users (email, password_hash) VALUES (?, ?)`, [email, hash]);

    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ token }) };
  } catch (error) {
    // Handle race condition where two signups happen simultaneously
    if (error.code === 'ER_DUP_ENTRY') {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'User already exists' }) };
    }
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Signup failed' }) };
  } finally {
    if (connection) connection.release();
  }
};
