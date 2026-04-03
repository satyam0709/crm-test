const { pool } = require("../config/database");
const { getAuth } = require("@clerk/express");

async function getConversation(req, res) {
  try {
    const { userId } = getAuth(req);
    const { otherId } = req.params;

    const [[me]] = await pool.execute(
      "SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1", [userId]
    );
    if (!me) return res.status(404).json({ success: false, message: "User not found" });

    const [rows] = await pool.execute(
      `SELECT m.*,
              s.first_name as sender_first, s.last_name as sender_last,
              s.clerk_user_id as clerk_sender_id
       FROM chat_messages m
       JOIN users s ON s.id = m.sender_id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC
       LIMIT 200`,
      [me.id, Number(otherId), Number(otherId), me.id]
    );

    // Mark incoming as read
    await pool.execute(
      "UPDATE chat_messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0",
      [me.id, Number(otherId)]
    );

    res.json({ success: true, messages: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function sendMessage(req, res) {
  try {
    const { userId } = getAuth(req);
    const { receiver_id, body } = req.body;

    if (!body?.trim()) {
      return res.status(400).json({ success: false, message: "Message body is required" });
    }

    const [[me]] = await pool.execute(
      "SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1", [userId]
    );
    if (!me) return res.status(404).json({ success: false, message: "User not found" });

    const [result] = await pool.execute(
      "INSERT INTO chat_messages (sender_id, receiver_id, body) VALUES (?, ?, ?)",
      [me.id, receiver_id, body.trim()]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getUnreadCount(req, res) {
  try {
    const { userId } = getAuth(req);
    const [[me]] = await pool.execute(
      "SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1", [userId]
    );
    if (!me) return res.json({ success: true, count: 0 });

    const [[{ count }]] = await pool.execute(
      "SELECT COUNT(*) as count FROM chat_messages WHERE receiver_id = ? AND is_read = 0",
      [me.id]
    );
    res.json({ success: true, count: Number(count) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getConversation, sendMessage, getUnreadCount };