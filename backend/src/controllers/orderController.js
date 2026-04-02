const db = require("../config/database");

const placeOrder = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { package_name, package_price, currency, addons, subtotal, gst, total } = req.body;

    await db.execute(
      `INSERT INTO orders (user_id, package_name, package_price, currency, addons, subtotal, gst, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, package_name, package_price, currency, JSON.stringify(addons), subtotal, gst, total]
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
    const [rows] = await db.execute(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json({ success: true, orders: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

module.exports = { placeOrder, getOrders };