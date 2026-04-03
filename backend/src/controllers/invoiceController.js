const { pool } = require("../config/database");
const { getAuth } = require("@clerk/express");

async function getInvoices(req, res) {
  try {
    const { userId } = getAuth(req);
    const { type = "sales", status, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = "type = ?";
    const params = [type];

    if (status) { where += " AND status = ?"; params.push(status); }

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM invoices WHERE ${where}`, params
    );

    const [rows] = await pool.execute(
      `SELECT * FROM invoices WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({ success: true, total, invoices: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createInvoice(req, res) {
  try {
    const { userId } = getAuth(req);
    const {
      type = "sales", customer_name, customer_email, vendor_name,
      invoice_date, due_date, subtotal, tax, total, status = "draft", notes
    } = req.body;

    const [[user]] = await pool.execute(
      "SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1", [userId]
    );

    const year   = new Date().getFullYear();
    const [[{ cnt }]] = await pool.execute(
      "SELECT COUNT(*) as cnt FROM invoices WHERE YEAR(created_at) = ?", [year]
    );
    const invoiceNumber = `${type.toUpperCase().slice(0,3)}-${year}-${String(cnt + 1).padStart(4, "0")}`;

    const [result] = await pool.execute(
      `INSERT INTO invoices
         (invoice_number, type, customer_name, customer_email, vendor_name,
          invoice_date, due_date, subtotal, tax, total, status, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber, type, customer_name || null, customer_email || null, vendor_name || null,
        invoice_date, due_date || null, subtotal || 0, tax || 0, total || 0, status, notes || null,
        user?.id || null
      ]
    );
    res.json({ success: true, id: result.insertId, invoice_number: invoiceNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateInvoiceStatus(req, res) {
  try {
    const { status } = req.body;
    await pool.execute("UPDATE invoices SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteInvoice(req, res) {
  try {
    await pool.execute("DELETE FROM invoices WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getInvoices, createInvoice, updateInvoiceStatus, deleteInvoice };