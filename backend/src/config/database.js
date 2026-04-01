const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host:process.env.DB_HOST || "localhost",
  port:Number(process.env.DB_PORT) || 3306,
  user:process.env.DB_USER || "root",
  password:process.env.DB_PASS  || "",
  database:process.env.DB_NAME || "rnd_crm",
  waitForConnections:true,
  connectionLimit:10,
  queueLimit:0,
  timezone:"+05:30",
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