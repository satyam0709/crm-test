const { pool } = require("../config/database");
const { getAuth } = require("@clerk/express");

async function getReminders(req, res) {
  try {
    const { userId } = getAuth(req);
    const [rows] = await pool.execute(
      `SELECT r.*, l.name as lead_name
       FROM reminders r
       LEFT JOIN leads l ON l.id = r.lead_id
       WHERE r.user_id = (SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1)
       ORDER BY r.remind_at ASC`,
      [userId]
    );
    res.json({ success: true, reminders: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createReminder(req, res) {
  try {
    const { userId } = getAuth(req);
    const { title, note, remind_at, lead_id } = req.body;

    const [[user]] = await pool.execute(
      "SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1",
      [userId]
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const [result] = await pool.execute(
      `INSERT INTO reminders (user_id, title, note, remind_at, lead_id)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, title, note || null, remind_at, lead_id || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateReminder(req, res) {
  try {
    const { id } = req.params;
    const { is_done } = req.body;
    await pool.execute("UPDATE reminders SET is_done = ? WHERE id = ?", [is_done ? 1 : 0, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteReminder(req, res) {
  try {
    await pool.execute("DELETE FROM reminders WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getReminders, createReminder, updateReminder, deleteReminder };