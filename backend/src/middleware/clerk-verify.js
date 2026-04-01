const { getAuth } = require("@clerk/express");
const { pool } = require("../config/database");

async function clerkVerify(req, res, next) {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Clerk token missing" });
    }

    const [rows] = await pool.execute(
      "SELECT id, clerk_user_id, email, role, is_active FROM users WHERE clerk_user_id = ? AND is_active = 1",
      [clerkUserId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ success: false, message: "User not found or inactive" });
    }

    const user = rows[0];

    req.user = {
      id: user.id,
      clerk_user_id: user.clerk_user_id,
      email: user.email,
      role: user.role,
      isAdmin: user.role === "admin",
    };

    next();
  } catch (err) {
    console.error("clerkVerify error", err);
    res.status(500).json({ success: false, message: "Internal auth verification error" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden: admin only" });
  }
  next();
}

module.exports = { clerkVerify, requireAdmin };