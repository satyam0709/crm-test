const { pool } = require("../config/database");
const { getAuth } = require("@clerk/express");

async function getMeetings(req, res) {
  try {
    const { userId } = getAuth(req);
    const [rows] = await pool.execute(
      `SELECT m.*,
              u.first_name as organizer_first, u.last_name as organizer_last,
              l.name as lead_name,
              (SELECT COUNT(*) FROM meeting_attendees ma WHERE ma.meeting_id = m.id) as attendees_count
       FROM meetings m
       LEFT JOIN users u ON u.id = m.organizer_id
       LEFT JOIN leads l ON l.id = m.lead_id
       WHERE m.organizer_id = (SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1)
          OR m.id IN (
            SELECT ma.meeting_id FROM meeting_attendees ma
            WHERE ma.user_id = (SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1)
          )
       ORDER BY m.start_time DESC
       LIMIT ?`,
      [userId, userId, Number(req.query.limit) || 100]
    );
    res.json({ success: true, meetings: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createMeeting(req, res) {
  try {
    const { userId } = getAuth(req);
    const { title, description, start_time, end_time, location, meet_link, lead_id, attendee_ids } = req.body;

    const [[user]] = await pool.execute(
      "SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1",
      [userId]
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const [result] = await pool.execute(
      `INSERT INTO meetings (title, description, start_time, end_time, location, meet_link, organizer_id, lead_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, start_time, end_time || null, location || null, meet_link || null, user.id, lead_id || null]
    );

    const meetingId = result.insertId;

    if (Array.isArray(attendee_ids) && attendee_ids.length > 0) {
      const vals = attendee_ids.map((uid) => [meetingId, uid]);
      await pool.query("INSERT IGNORE INTO meeting_attendees (meeting_id, user_id) VALUES ?", [vals]);
    }

    res.json({ success: true, id: meetingId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteMeeting(req, res) {
  try {
    await pool.execute("DELETE FROM meetings WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getMeetings, createMeeting, deleteMeeting };