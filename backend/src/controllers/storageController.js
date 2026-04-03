const { pool } = require("../config/database");
const { getAuth } = require("@clerk/express");

async function getStorage(req, res) {
  try {
    const { userId } = getAuth(req);

    const [[me]] = await pool.execute(
      "SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1", [userId]
    );
    if (!me) return res.status(404).json({ success: false, message: "User not found" });

    const [files] = await pool.execute(
      `SELECT fa.*, l.name as lead_name
       FROM file_attachments fa
       LEFT JOIN leads l ON l.id = fa.lead_id
       WHERE fa.user_id = ?
       ORDER BY fa.created_at DESC`,
      [me.id]
    );

    const totalBytes = files.reduce((s, f) => s + (f.size_bytes || 0), 0);
    const usedMb     = +(totalBytes / (1024 * 1024)).toFixed(2);

    // Default quota 1024 MB; in production pull from the user's plan/order
    res.json({
      success: true,
      usage: { used_mb: usedMb, total_mb: 1024 },
      files,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getStorage };