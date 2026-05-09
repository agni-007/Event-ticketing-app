import mysql from 'mysql2/promise';

let pool;

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT) || 4000,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: { rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 20,        // More concurrent connections
      queueLimit: 50,             // Queue up to 50 waiting requests
      connectTimeout: 10000,      // 10s timeout
      idleTimeout: 60000,         // Release idle connections after 60s
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
}

export async function getDbConnection() {
  return getPool().getConnection();
}

// Handles OPTIONS preflight for CORS
export function handleOptions() {
  return {
    statusCode: 204,
    headers: corsHeaders,
    body: ''
  };
}
