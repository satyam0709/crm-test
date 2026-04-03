const { getAuth } = require("@clerk/express");
const { pool } = require("../config/database");

async function clerkVerify(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const [rows] = await pool.execute(
      `SELECT id, clerk_user_id, email, role, is_active
       FROM users
       WHERE clerk_user_id = ? AND is_active = 1
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    const user = rows[0];

    req.user = {
      id: user.id,
      clerkUserId: user.clerk_user_id,
      email: user.email,
      role: user.role,
      isAdmin: user.role === "admin",
    };

    // Safe async update (log errors instead of ignoring)
    pool.execute(
      "UPDATE users SET last_login = NOW() WHERE clerk_user_id = ?",
      [userId]
    ).catch((err) => {
      console.error("Last login update failed:", err.message);
    });

    next();
  } catch (err) {
    console.error("clerkVerify error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin only" });
  }

  next();
}

module.exports = { clerkVerify, requireAdmin };