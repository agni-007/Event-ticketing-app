import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function setupDB() {
  console.log('Connecting to TiDB...');
  
  // Connect without database first to create it
  const connection = await mysql.createConnection({
    host: process.env.TIDB_HOST,
    port: process.env.TIDB_PORT,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log('Creating database eventdb...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS eventdb;`);
    await connection.query(`USE eventdb;`);

    console.log('Creating events table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200), description TEXT,
        date DATETIME, venue VARCHAR(200),
        image_url VARCHAR(500), is_active BOOLEAN DEFAULT TRUE
      );
    `);

    console.log('Creating registrations table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT, full_name VARCHAR(100),
        email VARCHAR(150), phone VARCHAR(20),
        client_id VARCHAR(20) UNIQUE, reg_id VARCHAR(40) UNIQUE,
        qr_data TEXT, attended BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id)
      );
    `);

    console.log('Creating admins table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE, password_hash VARCHAR(255)
      );
    `);

    console.log('Inserting default admin user...');
    const hash = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT IGNORE INTO admins (username, password_hash) VALUES ('admin', ?);
    `, [hash]);

    console.log('Creating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) UNIQUE,
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database setup completed successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await connection.end();
  }
}

setupDB();
