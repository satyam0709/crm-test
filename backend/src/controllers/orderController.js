const { pool } = require("../config/database");

const placeOrder = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { package_name, package_price, currency, addons, subtotal, gst, total } = req.body;

    if (!package_name && (!Array.isArray(addons) || addons.length === 0)) {
      return res.status(400).json({ success: false, message: "No items in order." });
    }

    await pool.execute(
      `INSERT INTO orders (user_id, package_name, package_price, currency, addons, subtotal, gst, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'trial')`,
      [
        userId,
        package_name || null,
        package_price || 0,
        currency || "INR",
        JSON.stringify(addons || []),
        subtotal || 0,
        gst || 0,
        total || 0,
      ]
    );

    res.json({ success: true, message: "Order placed successfully." });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ success: false, message: "Failed to place order." });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const [rows] = await pool.execute(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json({ success: true, orders: rows });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

module.exports = { placeOrder, getOrders };