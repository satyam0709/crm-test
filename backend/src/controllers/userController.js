const { getAuth } = require("@clerk/express");
const { clerkClient } = require("@clerk/backend");
const { pool }    = require("../config/database");

async function ensureUserInDb(clerkUserId) {
  const [existing] = await pool.execute(
    "SELECT id FROM users WHERE clerk_user_id = ?",
    [clerkUserId]
  );

  if (existing.length > 0) {
    return existing[0];
  }

  const user = await clerkClient.users.getUser(clerkUserId);
  const emailObj = user.email_addresses?.find((item) => item.verified) || user.email_addresses?.[0];
  const email = emailObj?.email_address || "";
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  const profileImage = user.image_url || null;

  const [result] = await pool.execute(
    `INSERT INTO users (clerk_user_id, email, first_name, last_name, profile_image, role)
     VALUES (?, ?, ?, ?, ?, 'staff')
     ON DUPLICATE KEY UPDATE
       email = VALUES(email),
       first_name = VALUES(first_name),
       last_name = VALUES(last_name),
       profile_image = VALUES(profile_image),
       is_active = 1,
       updated_at = NOW()`,
    [clerkUserId, email, firstName, lastName, profileImage]
  );

  return { id: result.insertId, clerk_user_id: clerkUserId };
}

async function getMe(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    await ensureUserInDb(userId);

    const [rows] = await pool.execute(
      `SELECT id, clerk_user_id, email, first_name, last_name,
              profile_image, role, is_active, last_login, created_at
       FROM users
       WHERE clerk_user_id = ? AND is_active = 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found in database after sync.",
      });
    }

    // update last_login each time getMe is called (or do this in webhook session.created)
    await pool.execute("UPDATE users SET last_login = NOW() WHERE clerk_user_id = ?", [userId]);

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function syncCurrentUser(req, res) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    await ensureUserInDb(userId);
    return res.json({ success: true, message: "User synced successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listUsers(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, clerk_user_id, email, first_name, last_name,
              role, is_active, last_login, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
module.exports = { getMe, listUsers, syncCurrentUser };