const { pool } = require("../config/database");

// ── Company Settings ─────────────────────────────────────────

async function getCompanySettings(req, res) {
  try {
    const [rows] = await pool.execute("SELECT * FROM company_settings WHERE id = 1 LIMIT 1");
    res.json({ success: true, data: rows[0] || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateCompanySettings(req, res) {
  try {
    const {
      company_name, website, phone, email, address,
      city, state, country, gst_number, pan_number,
    } = req.body;

    await pool.execute(
      `INSERT INTO company_settings
         (id, company_name, website, phone, email, address, city, state, country, gst_number, pan_number)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         company_name=VALUES(company_name), website=VALUES(website), phone=VALUES(phone),
         email=VALUES(email), address=VALUES(address), city=VALUES(city),
         state=VALUES(state), country=VALUES(country),
         gst_number=VALUES(gst_number), pan_number=VALUES(pan_number)`,
      [
        company_name || null, website || null, phone || null, email || null,
        address || null, city || null, state || null, country || "India",
        gst_number || null, pan_number || null,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── Integrations ─────────────────────────────────────────────

async function getIntegrations(req, res) {
  try {
    const [rows] = await pool.execute("SELECT * FROM integrations ORDER BY `key` ASC");
    res.json({ success: true, integrations: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function toggleIntegration(req, res) {
  try {
    const { key } = req.params;
    await pool.execute(
      "UPDATE integrations SET is_active = NOT is_active WHERE `key` = ?",
      [key]
    );
    const [[row]] = await pool.execute(
      "SELECT is_active FROM integrations WHERE `key` = ?", [key]
    );
    res.json({ success: true, is_active: !!row?.is_active });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getCompanySettings, updateCompanySettings,
  getIntegrations, toggleIntegration,
};