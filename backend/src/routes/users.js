const express = require("express");
const { requireAuth } = require("@clerk/express");
const { clerkVerify, requireAdmin } = require("../middleware/clerk-verify");
const { pool } = require("../config/database");

const router = express.Router();
router.use(requireAuth(), clerkVerify);

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, clerk_user_id, email, first_name, last_name, role, is_active, last_login, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error("GET /api/users", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch("/:id/role", requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) return res.status(400).json({ success: false, message: "Invalid user id" });

    const { role } = req.body;
    if (!role || !["admin", "manager", "staff"].includes(role)) {
      return res.status(400).json({ success: false, message: "role is required and must be admin|manager|staff" });
    }

    const [result] = await pool.execute("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const [updated] = await pool.execute("SELECT id, clerk_user_id, email, role FROM users WHERE id = ?", [userId]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("PATCH /api/users/:id/role", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
