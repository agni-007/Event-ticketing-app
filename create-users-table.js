import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function createUsersTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      port: process.env.TIDB_PORT,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: { rejectUnauthorized: true }
    });

    console.log('Connected to TiDB. Creating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) UNIQUE,
        password_hash VARCHAR(255)
      );
    `);
    console.log('users table created successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) connection.end();
  }
}

createUsersTable();
