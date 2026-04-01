const express = require("express");
const { requireAuth } = require("@clerk/express");
const { clerkVerify } = require("../middleware/clerk-verify");
const { pool } = require("../config/database");

const router = express.Router();
router.use(requireAuth(), clerkVerify);

router.get("/", async (req, res) => {
  try {
    const uid = req.user.id;

    const [[{ my_leads }]] = await pool.execute(
      "SELECT COUNT(*) as my_leads FROM leads WHERE assigned_to = ?",
      [uid]
    );

    const [[{ tasks_overdue }]] = await pool.execute(
      `SELECT COUNT(*) as tasks_overdue
       FROM tasks
       WHERE assigned_to = ?
         AND status != 'done'
         AND due_date IS NOT NULL
         AND due_date < CURDATE()`,
      [uid]
    );

    const [team_leads] = await pool.execute(
      `SELECT u.id, u.clerk_user_id, u.email, COUNT(l.id) as leads_count
       FROM users u
       LEFT JOIN leads l ON l.assigned_to = u.id
       GROUP BY u.id
       ORDER BY leads_count DESC`
    );

    const [team_tasks] = await pool.execute(
      `SELECT u.id, u.clerk_user_id, u.email,
         SUM(t.status = 'todo') as todo,
         SUM(t.status = 'in_progress') as in_progress,
         SUM(t.status = 'done') as done
       FROM users u
       LEFT JOIN tasks t ON t.assigned_to = u.id
       GROUP BY u.id
       ORDER BY done DESC, in_progress DESC`);

    res.json({
      success: true,
      data: {
        my_leads: Number(my_leads),
        tasks_overdue: Number(tasks_overdue),
        team_performance: {
          leads: team_leads,
          tasks: team_tasks,
        },
      },
    });
  } catch (err) {
    console.error("GET /api/dashboard", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
