const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+05:30",
  // FIXED: Automatically use SSL if in production or if DB_SSL variable is set
  ssl: process.env.NODE_ENV === "production" || process.env.DB_SSL === "true" 
    ? { rejectUnauthorized: false } 
    : false,
});

async function testConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("DB connected successfully");
  } catch (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { pool, testConnection };