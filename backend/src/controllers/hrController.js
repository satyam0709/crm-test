const { pool } = require("../config/database");
const { getAuth } = require("@clerk/express");

// ── Attendance ───────────────────────────────────────────────

async function getAttendance(req, res) {
  try {
    const { month, year } = req.query;
    const m = Number(month) || new Date().getMonth() + 1;
    const y = Number(year)  || new Date().getFullYear();

    const [rows] = await pool.execute(
      `SELECT a.*,
              u.first_name, u.last_name, u.email,
              CONCAT(u.first_name, ' ', u.last_name) as user_name
       FROM attendance a
       JOIN users u ON u.id = a.user_id
       WHERE MONTH(a.date) = ? AND YEAR(a.date) = ?
       ORDER BY a.date DESC, u.first_name ASC`,
      [m, y]
    );
    res.json({ success: true, records: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function markAttendance(req, res) {
  try {
    const { user_id, date, check_in, check_out, status, note } = req.body;
    await pool.execute(
      `INSERT INTO attendance (user_id, date, check_in, check_out, status, note)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE check_in=VALUES(check_in), check_out=VALUES(check_out),
                               status=VALUES(status), note=VALUES(note)`,
      [user_id, date, check_in || null, check_out || null, status || "present", note || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── Leaves ───────────────────────────────────────────────────

async function getLeaves(req, res) {
  try {
    const { status } = req.query;
    let where = "1=1";
    const params = [];
    if (status) { where += " AND lr.status = ?"; params.push(status); }

    const [rows] = await pool.execute(
      `SELECT lr.*,
              CONCAT(u.first_name, ' ', u.last_name) as user_name,
              u.email,
              CONCAT(a.first_name, ' ', a.last_name) as approver_name
       FROM leave_requests lr
       JOIN  users u ON u.id = lr.user_id
       LEFT JOIN users a ON a.id = lr.approved_by
       WHERE ${where}
       ORDER BY lr.created_at DESC`,
      params
    );
    res.json({ success: true, leaves: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createLeaveRequest(req, res) {
  try {
    const { userId } = getAuth(req);
    const { leave_type, from_date, to_date, reason } = req.body;

    const [[user]] = await pool.execute(
      "SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1", [userId]
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const days = Math.ceil(
      (new Date(to_date) - new Date(from_date)) / 86400000
    ) + 1;

    const [result] = await pool.execute(
      `INSERT INTO leave_requests (user_id, leave_type, from_date, to_date, days, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, leave_type || "annual", from_date, to_date, days, reason || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function approveLeave(req, res) {
  try {
    const { userId } = getAuth(req);
    const [[approver]] = await pool.execute(
      "SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1", [userId]
    );
    await pool.execute(
      "UPDATE leave_requests SET status='approved', approved_by=? WHERE id=?",
      [approver?.id || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function rejectLeave(req, res) {
  try {
    const { userId } = getAuth(req);
    const [[approver]] = await pool.execute(
      "SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1", [userId]
    );
    await pool.execute(
      "UPDATE leave_requests SET status='rejected', approved_by=? WHERE id=?",
      [approver?.id || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getAttendance, markAttendance,
  getLeaves, createLeaveRequest, approveLeave, rejectLeave,
};