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

router.get("/", async (req, res) => {
  try {
    const { status, priority, assigned_to, due_before, due_after, my } = req.query;
    const conditions = ["1=1"];
    const params = [];

    if (status) { conditions.push("status = ?"); params.push(status); }
    if (priority) { conditions.push("priority = ?"); params.push(priority); }
    if (due_before) { conditions.push("due_date <= ?"); params.push(due_before); }
    if (due_after) { conditions.push("due_date >= ?"); params.push(due_after); }

    if (assigned_to === "me") {
      conditions.push("assigned_to = ?");
      params.push(req.user.id);
    } else if (assigned_to) {
      const mapped = await resolveUserId(assigned_to);
      if (mapped) { conditions.push("assigned_to = ?"); params.push(mapped); }
      else { return res.status(400).json({ success: false, message: "assigned_to user not found" }); }
    } else if (my === "true") {
      conditions.push("(created_by = ? OR assigned_to = ?)");
      params.push(req.user.id, req.user.id);
    }

    const [tasks] = await pool.execute(
      `SELECT t.*, u.email as assigned_email, u.clerk_user_id as assigned_to_clerk
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE ${conditions.join(" AND ")}
       ORDER BY t.due_date ASC, t.created_at DESC`,
      params
    );

    res.json({ success: true, total: tasks.length, data: tasks });
  } catch (err) {
    console.error("GET /api/tasks", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    if (!taskId) return res.status(400).json({ success: false, message: "Invalid task id" });

    const [rows] = await pool.execute(
      `SELECT t.*, u.email as assigned_email, u.clerk_user_id as assigned_to_clerk
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = ?`,
      [taskId]
    );

    if (rows.length === 0) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("GET /api/tasks/:id", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, lead_id, assigned_to, due_date, priority, status } = req.body;

    if (!title) return res.status(400).json({ success: false, message: "title is required" });

    const assignedUserId = await resolveUserId(assigned_to) || null;

    const [result] = await pool.execute(
      `INSERT INTO tasks (title, description, lead_id, assigned_to, created_by, due_date, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, lead_id || null, assignedUserId, req.user.id, due_date || null, priority || "medium", status || "todo"]
    );

    const [created] = await pool.execute("SELECT * FROM tasks WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: created[0] });
  } catch (err) {
    console.error("POST /api/tasks", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    if (!taskId) return res.status(400).json({ success: false, message: "Invalid task id" });

    const { title, description, lead_id, assigned_to, due_date, priority, status } = req.body;
    const assignedUserId = await resolveUserId(assigned_to) || null;

    const [result] = await pool.execute(
      `UPDATE tasks SET
         title = IFNULL(?, title),
         description = IFNULL(?, description),
         lead_id = IFNULL(?, lead_id),
         assigned_to = ?,
         due_date = IFNULL(?, due_date),
         priority = IFNULL(?, priority),
         status = IFNULL(?, status),
         updated_at = NOW()
       WHERE id = ?`,
      [title, description, lead_id, assignedUserId, due_date, priority, status, taskId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const [updated] = await pool.execute("SELECT * FROM tasks WHERE id = ?", [taskId]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("PUT /api/tasks/:id", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    if (!taskId) return res.status(400).json({ success: false, message: "Invalid task id" });

    const [result] = await pool.execute("DELETE FROM tasks WHERE id = ?", [taskId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    console.error("DELETE /api/tasks/:id", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
