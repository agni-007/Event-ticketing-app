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
    verifyAuth(event);
    const { regId } = JSON.parse(event.body);
    if (!regId) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing registration ID' }) };

    connection = await getDbConnection();

    // Use a transaction to prevent race condition where two scans happen simultaneously
    await connection.beginTransaction();

    const [regs] = await connection.query(
      `SELECT * FROM registrations WHERE reg_id = ? FOR UPDATE`,
      [regId]
    );

    if (regs.length === 0) {
      await connection.rollback();
      return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: 'Registration not found' }) };
    }

    const reg = regs[0];

    if (reg.status !== 'approved') {
      await connection.rollback();
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Registration is not approved yet' }) };
    }

    if (reg.attended) {
      await connection.rollback();
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: `${reg.full_name} has already been verified` }) };
    }

    await connection.query(`UPDATE registrations SET attended = true WHERE id = ?`, [reg.id]);
    await connection.commit();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, name: reg.full_name })
    };
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    return {
      statusCode: error.message === 'Unauthorized' ? 401 : 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Failed to verify attendee' })
    };
  } finally {
    if (connection) connection.release();
  }
};
