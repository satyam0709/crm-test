const { Webhook } = require("svix");
const { pool } = require("../config/database");
require("dotenv").config();

async function handleClerkWebhook(req, res) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is missing from .env");
    return res.status(500).json({ message: "Webhook secret not configured" });
  }

  const wh = new Webhook(webhookSecret);
  let event;

  try {
    event = wh.verify(req.body, {
      "svix-id":        req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const { type, data } = event;
  console.log(`📩  Clerk webhook received: ${type}`);

  try {
    if (type === "user.created") {
      const email     = data.email_addresses?.[0]?.email_address || "";
      const firstName = data.first_name  || "";
      const lastName  = data.last_name   || "";
      const imageUrl  = data.image_url   || null;

      await pool.execute(
        `INSERT INTO users (clerk_user_id, email, first_name, last_name, profile_image)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           email         = VALUES(email),
           first_name    = VALUES(first_name),
           last_name     = VALUES(last_name),
           profile_image = VALUES(profile_image),
           updated_at    = NOW()`,
        [data.id, email, firstName, lastName, imageUrl]
      );

      console.log(`New user saved to database: ${email}`);
    }

    if (type === "user.updated") {
      const email     = data.email_addresses?.[0]?.email_address || "";
      const firstName = data.first_name || "";
      const lastName  = data.last_name  || "";
      const imageUrl  = data.image_url  || null;

      await pool.execute(
        `UPDATE users
         SET email = ?, first_name = ?, last_name = ?, profile_image = ?, updated_at = NOW()
         WHERE clerk_user_id = ?`,
        [email, firstName, lastName, imageUrl, data.id]
      );

      console.log(`User updated in database: ${email}`);
    }

    if (type === "user.deleted") {
      await pool.execute(
        "UPDATE users SET is_active = 0, updated_at = NOW() WHERE clerk_user_id = ?",
        [data.id]
      );

      console.log(`User deactivated in database: clerk_id=${data.id}`);
    }

    if (type === "session.created") {
      await pool.execute(
        "UPDATE users SET last_login = NOW() WHERE clerk_user_id = ?",
        [data.user_id]
      );
    }

    res.status(200).json({ success: true, received: type });
  } catch (err) {
    console.error("Webhook database error:", err.message);
    res.status(500).json({ success: false, message: "Database error" });
  }
}

module.exports = { handleClerkWebhook };