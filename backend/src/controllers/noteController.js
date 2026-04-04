const { pool } = require("../config/database");
const { getAuth } = require("@clerk/express");

async function getNotes(req, res) {
  try {
    const { userId } = getAuth(req);
    const [rows] = await pool.execute(
      `SELECT n.*, l.name as lead_name
       FROM notes n
       LEFT JOIN leads l ON l.id = n.lead_id
       WHERE n.created_by = (SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1)
       ORDER BY n.created_at DESC`,
      [userId]
    );
    res.json({ success: true, notes: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createNote(req, res) {
  try {
    const { userId } = getAuth(req);
    const { title, content, lead_id } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    const [[user]] = await pool.execute(
      "SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1",
      [userId]
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const [result] = await pool.execute(
      "INSERT INTO notes (created_by, title, content, lead_id) VALUES (?, ?, ?, ?)",
      [user.id, title || null, content, lead_id || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateNote(req, res) {
  try {
    const { title, content } = req.body;
    await pool.execute(
      "UPDATE notes SET title = ?, content = ? WHERE id = ?",
      [title || null, content, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteNote(req, res) {
  try {
    await pool.execute("DELETE FROM notes WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getNotes, createNote, updateNote, deleteNote };