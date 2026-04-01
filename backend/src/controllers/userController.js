const { getAuth } = require("@clerk/express");
const { pool }    = require("../config/database");

async function getMe(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const [rows] = await pool.execute(
      `SELECT id, clerk_user_id, email, first_name, last_name,
              profile_image, role, is_active, last_login, created_at
       FROM users
       WHERE clerk_user_id = ? AND is_active = 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found in database.",
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
async function listUsers(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, clerk_user_id, email, first_name, last_name,
              role, is_active, last_login, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
module.exports = { getMe, listUsers };