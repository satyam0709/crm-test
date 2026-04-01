const mysql = require("mysql2/promise");
require("dotenv").config();

const DB = process.env.DB_NAME || "rnd_crm";

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: DB,
    multipleStatements: true,
  });

  console.log("\n🔧 Seeding demo data for crm-rnd...");

  const [existing] = await conn.execute("SELECT id FROM users WHERE clerk_user_id = 'seed-admin' LIMIT 1");
  let adminId;

  if (existing.length === 0) {
    const [result] = await conn.execute(
      `INSERT INTO users (clerk_user_id, email, first_name, last_name, role, is_active)
       VALUES ('seed-admin', 'admin@crm-rnd.test', 'Seed', 'Admin', 'admin', 1)`
    );
    adminId = result.insertId;
  } else {
    adminId = existing[0].id;
  }

  const staffUsers = [
    { clerk_id: "seed-manager", email: "manager@crm-rnd.test", first_name: "Seed", last_name: "Manager", role: "manager" },
    { clerk_id: "seed-staff", email: "staff@crm-rnd.test", first_name: "Seed", last_name: "Staff", role: "staff" },
  ];

  for (const user of staffUsers) {
    await conn.execute(
      `INSERT INTO users (clerk_user_id, email, first_name, last_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE email = VALUES(email), first_name = VALUES(first_name), last_name = VALUES(last_name), role = VALUES(role), is_active = 1`,
      [user.clerk_id, user.email, user.first_name, user.last_name, user.role]
    );
  }

  const [managerRow] = await conn.execute("SELECT id FROM users WHERE clerk_user_id = 'seed-manager' LIMIT 1");
  const [staffRow] = await conn.execute("SELECT id FROM users WHERE clerk_user_id = 'seed-staff' LIMIT 1");

  const managerId = managerRow[0]?.id || adminId;
  const staffId = staffRow[0]?.id || adminId;

  const leadValues = [
    ["Acme Industries", "+911234567890", "contact@acme.test", "indiamart", "new", managerId, adminId, "Initial lead from IndiaMart."],
    ["Beta Corp", "+919876543210", "lead@beta.test", "online", "processing", staffId, managerId, "Following up after demo."],
  ];
  const leadPlaceholders = leadValues.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(",");
  await conn.execute(
    `INSERT INTO leads (name, phone, email, source, status, assigned_to, created_by, notes) VALUES ${leadPlaceholders} `,
    leadValues.flat()
  );

  const taskValues = [
    ["Call Acme for quote", "Confirm pricing and packages", 1, managerId, adminId, new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), "high", "todo"],
    ["Send Beta proposal", "Email formal proposal document", 2, staffId, managerId, new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), "medium", "in_progress"],
  ];
  const taskPlaceholders = taskValues.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(",");
  await conn.execute(
    `INSERT INTO tasks (title, description, lead_id, assigned_to, created_by, due_date, priority, status) VALUES ${taskPlaceholders}`,
    taskValues.flat()
  );

  const noteValues = [
    [1, "Initial call done, pricing shared.", managerId],
    [2, "Lead requested one-week extension for decision.", staffId],
  ];
  const notePlaceholders = noteValues.map(() => "(?, ?, ?)").join(",");
  await conn.execute(
    `INSERT INTO notes (lead_id, content, created_by) VALUES ${notePlaceholders}`,
    noteValues.flat()
  );

  console.log("✅ Seed data inserted. Admin clerk_user_id=seed-admin, manager=seed-manager, staff=seed-staff");
  await conn.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});