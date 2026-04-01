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

  const [rows] = await pool.execute(
    "SELECT id FROM users WHERE clerk_user_id = ? AND is_active = 1",
    [assignedTo]
  );
  return rows.length ? rows[0].id : null;
}

router.get("/", async (req, res) => {
  try {
    const { status, source, assigned_to, my } = req.query;
    const conditions = ["1=1"];
    const params = [];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (source) {
      conditions.push("source = ?");
      params.push(source);
    }

    if (assigned_to === "me") {
      conditions.push("assigned_to = ?");
      params.push(req.user.id);
    } else if (assigned_to) {
      const mapped = await resolveUserId(assigned_to);
      if (mapped) {
        conditions.push("assigned_to = ?");
        params.push(mapped);
      } else {
        return res.status(400).json({ success: false, message: "assigned_to user not found" });
      }
    } else if (my === "true") {
      conditions.push("(created_by = ? OR assigned_to = ?)");
      params.push(req.user.id, req.user.id);
    }

    const whereSql = conditions.join(" AND ");
    const [leads] = await pool.execute(
      `SELECT l.*, u.first_name AS assigned_name, u.email AS assigned_email
       FROM leads l
       LEFT JOIN users u ON l.assigned_to = u.id
       WHERE ${whereSql}
       ORDER BY l.created_at DESC`,
      params
    );

    res.json({ success: true, total: leads.length, data: leads });
  } catch (err) {
    console.error("GET /api/leads", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const leadId = Number(req.params.id);
    if (!leadId) return res.status(400).json({ success: false, message: "Invalid lead id" });

    const [rows] = await pool.execute(
      `SELECT l.*, u.clerk_user_id as assigned_to_clerk, u.email AS assigned_email
       FROM leads l
       LEFT JOIN users u ON l.assigned_to = u.id
       WHERE l.id = ?`,
      [leadId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const [notes] = await pool.execute(
      `SELECT n.id, n.content, n.created_by, u.email as creator_email, n.created_at
       FROM notes n
       LEFT JOIN users u ON n.created_by = u.id
       WHERE n.lead_id = ? ORDER BY n.created_at ASC`,
      [leadId]
    );

    res.json({ success: true, data: { ...rows[0], notes } });
  } catch (err) {
    console.error("GET /api/leads/:id", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, phone, source, status, notes, assigned_to, company_name, email, label, follow_up_date, cancel_reason } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "name and phone are required" });
    }

    const assignedUserId = await resolveUserId(assigned_to) || null;

    const [result] = await pool.execute(
      `INSERT INTO leads
       (name, company_name, phone, email, source, status, label, cancel_reason, assigned_to, created_by, follow_up_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, company_name || null, phone, email || null, source || "other", status || "new", label || null, cancel_reason || null, assignedUserId, req.user.id, follow_up_date || null, notes || null]
    );

    const [createdRows] = await pool.execute(`SELECT * FROM leads WHERE id = ?`, [result.insertId]);
    res.status(201).json({ success: true, data: createdRows[0] });
  } catch (err) {
    console.error("POST /api/leads", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const leadId = Number(req.params.id);
    if (!leadId) return res.status(400).json({ success: false, message: "Invalid lead id" });

    const { name, phone, source, status, notes, assigned_to, company_name, email, label, follow_up_date, cancel_reason } = req.body;
    const assignedUserId = await resolveUserId(assigned_to) || null;

    const [result] = await pool.execute(
      `UPDATE leads SET
         name        = IFNULL(?, name),
         company_name = IFNULL(?, company_name),
         phone       = IFNULL(?, phone),
         email       = IFNULL(?, email),
         source      = IFNULL(?, source),
         status      = IFNULL(?, status),
         label       = IFNULL(?, label),
         cancel_reason = IFNULL(?, cancel_reason),
         assigned_to = ?,
         follow_up_date = ?,
         notes       = IFNULL(?, notes),
         updated_at  = NOW()
       WHERE id = ?`,
      [name, company_name, phone, email, source, status, label, cancel_reason, assignedUserId, follow_up_date, notes, leadId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const [updated] = await pool.execute(`SELECT * FROM leads WHERE id = ?`, [leadId]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("PUT /api/leads/:id", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const leadId = Number(req.params.id);
    if (!leadId) return res.status(400).json({ success: false, message: "Invalid lead id" });

    const [result] = await pool.execute("DELETE FROM leads WHERE id = ?", [leadId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.json({ success: true, message: "Lead deleted" });
  } catch (err) {
    console.error("DELETE /api/leads/:id", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
