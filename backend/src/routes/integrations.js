const express = require("express");
const { requireAuth } = require("@clerk/express");
const { clerkVerify } = require("../middleware/clerk-verify");
const { pool } = require("../config/database");

const router = express.Router();
router.use(requireAuth(), clerkVerify);

async function resolveUserId(assignedTo) {
  if (!assignedTo) return null;

  if (Number.isInteger(Number(assignedTo))) {
    const [rows] = await pool.execute("SELECT id FROM users WHERE id = ? AND is_active = 1", [Number(assignedTo)]);
    if (rows.length) return rows[0].id;
  }

  const [rows] = await pool.execute("SELECT id FROM users WHERE clerk_user_id = ? AND is_active = 1", [assignedTo]);
  return rows.length ? rows[0].id : null;
}

router.post("/indiamart", async (req, res) => {
  try {
    const { name, phone, email, company_name, message, assigned_to } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "name and phone are required" });
    }

    const assignedUserId = await resolveUserId(assigned_to) || null;

    const [result] = await pool.execute(
      `INSERT INTO leads (name, phone, email, company_name, source, status, assigned_to, created_by, notes)
       VALUES (?, ?, ?, ?, 'indiamart', 'new', ?, ?, ?)`,
      [name, phone, email || null, company_name || null, assignedUserId, req.user.id, message || null]
    );

    const [created] = await pool.execute("SELECT * FROM leads WHERE id = ?", [result.insertId]);

    res.status(201).json({ success: true, message: "IndiaMart lead ingested", data: created[0] });
  } catch (err) {
    console.error("POST /api/integrations/indiamart", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
