import { getDbConnection, corsHeaders, handleOptions } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  let connection;
  try {
    const { username, password } = JSON.parse(event.body);
    if (!username || !password) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Username and password required' }) };
    }

    connection = await getDbConnection();
    const [users] = await connection.query(`SELECT * FROM admins WHERE username = ?`, [username]);

    // Constant-time comparison to prevent timing attacks
    const dummyHash = '$2a$10$abcdefghijklmnopqrstuuVGmRPK1VNRGIBHzjHZs6KNqBNobCHfS';
    const hash = users.length > 0 ? users[0].password_hash : dummyHash;
    const isMatch = await bcrypt.compare(password, hash);

    if (users.length === 0 || !isMatch) {
      return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid credentials' }) };
    }

    const token = jwt.sign(
      { id: users[0].id, username: users[0].username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ token }) };
  } catch (error) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Login failed' }) };
  } finally {
    if (connection) connection.release();
  }
};
