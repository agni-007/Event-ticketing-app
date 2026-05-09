import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function updateTable() {
  const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      port: process.env.TIDB_PORT,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: { rejectUnauthorized: true }
  });
  try {
    await connection.query('ALTER TABLE registrations ADD COLUMN user_id INT');
    console.log('Added user_id');
  } catch(e) { console.error(e.message); }
  
  try {
    await connection.query("ALTER TABLE registrations ADD COLUMN status VARCHAR(20) DEFAULT 'pending'");
    console.log('Added status');
  } catch(e) { console.error(e.message); }
  
  await connection.end();
}
updateTable();
