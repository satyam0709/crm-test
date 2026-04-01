const { pool } = require("../config/database");

async function submitContact(req, res) {
  try {
    const { name, phone, email, message, type = "contact" } = req.body;

    if (!name || !phone || !email) {
      return res.status(422).json({
        success: false,
        message: "Name, phone and email are required",
      });
    }

    const validTypes = ["contact", "demo"];
    if (!validTypes.includes(type)) {
      return res.status(422).json({
        success: false,
        message: 'Type must be "contact" or "demo"',
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO contact_requests (name, phone, email, message, type)
       VALUES (?, ?, ?, ?, ?)`,
      [name, phone, email, message || null, type]
    );

    res.status(201).json({
      success: true,
      message:
        type === "demo"
          ? "Demo request received! We'll contact you within 24 hours."
          : "Message sent! We'll get back to you shortly.",
      data: { id: result.insertId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getContacts(req, res) {
  try {
    const { type, is_read } = req.query;
    let where = "WHERE 1=1";
    const params = [];

    if (type) {
      where += " AND type = ?";
      params.push(type);
    }
    if (is_read !== undefined) {
      where += " AND is_read = ?";
      params.push(is_read === "true" ? 1 : 0);
    }

    const [rows] = await pool.execute(
      `SELECT * FROM contact_requests ${where} ORDER BY created_at DESC`,
      params
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    await pool.execute(
      "UPDATE contact_requests SET is_read = 1 WHERE id = ?",
      [id]
    );
    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { submitContact, getContacts, markAsRead };