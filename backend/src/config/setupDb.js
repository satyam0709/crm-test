const mysql = require("mysql2/promise");
require("dotenv").config();

async function setupDb() {
  const DB = process.env.DB_NAME || "rnd_crm";
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || "localhost",
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    multipleStatements: false,
  });

  console.log(`\n🔧  Setting up database: ${DB}\n`);

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${DB}\``);
  console.log("Database ready u can use this");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
      clerk_user_id   VARCHAR(100)  NOT NULL UNIQUE,
      email           VARCHAR(150)  NOT NULL,
      first_name      VARCHAR(80)   DEFAULT NULL,
      last_name       VARCHAR(80)   DEFAULT NULL,
      profile_image   VARCHAR(500)  DEFAULT NULL,
      role            ENUM('admin','manager','staff') NOT NULL DEFAULT 'staff',
      is_active       TINYINT(1)    NOT NULL DEFAULT 1,
      last_login      DATETIME      DEFAULT NULL,
      created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_clerk_id (clerk_user_id),
      KEY idx_email    (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: users");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
      name            VARCHAR(100)  NOT NULL,
      company_name    VARCHAR(150)  DEFAULT NULL,
      phone           VARCHAR(20)   NOT NULL,
      email           VARCHAR(150)  DEFAULT NULL,
      source          ENUM('online','indiamart','facebook','google_ads','99acres','housing','magicbricks','tradeindia','just_dial','wordpress','referral','other') NOT NULL DEFAULT 'other',
      status          ENUM('new','processing','close_by','confirm','cancel') NOT NULL DEFAULT 'new',
      label           VARCHAR(50)   DEFAULT NULL,
      cancel_reason   VARCHAR(255)  DEFAULT NULL,
      assigned_to     INT UNSIGNED  DEFAULT NULL,
      created_by      INT UNSIGNED  NOT NULL,
      follow_up_date  DATE          DEFAULT NULL,
      notes           TEXT          DEFAULT NULL,
      created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_status     (status),
      KEY idx_source     (source),
      KEY idx_assigned   (assigned_to),
      KEY idx_follow_up  (follow_up_date),
      KEY idx_created_at (created_at),
      CONSTRAINT fk_lead_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_lead_creator  FOREIGN KEY (created_by)  REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: leads");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS lead_followups (
      id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
      lead_id              INT UNSIGNED NOT NULL,
      note                 TEXT         NOT NULL,
      next_follow_up_date  DATE         DEFAULT NULL,
      created_by           INT UNSIGNED NOT NULL,
      created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_lead_id (lead_id),
      CONSTRAINT fk_followup_lead FOREIGN KEY (lead_id)    REFERENCES leads(id) ON DELETE CASCADE,
      CONSTRAINT fk_followup_user FOREIGN KEY (created_by) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: lead_followups");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS contact_requests (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name       VARCHAR(100) NOT NULL,
      phone      VARCHAR(20)  NOT NULL,
      email      VARCHAR(150) NOT NULL,
      message    TEXT         DEFAULT NULL,
      type       ENUM('contact','demo') NOT NULL DEFAULT 'contact',
      is_read    TINYINT(1)   NOT NULL DEFAULT 0,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_type    (type),
      KEY idx_is_read (is_read)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: contact_requests");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      title       VARCHAR(200) NOT NULL,
      description TEXT         DEFAULT NULL,
      lead_id     INT UNSIGNED DEFAULT NULL,
      assigned_to INT UNSIGNED DEFAULT NULL,
      created_by  INT UNSIGNED NOT NULL,
      due_date    DATE         DEFAULT NULL,
      priority    ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
      status      ENUM('todo','in_progress','done') NOT NULL DEFAULT 'todo',
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_assigned (assigned_to),
      KEY idx_status   (status),
      KEY idx_due_date (due_date),
      CONSTRAINT fk_task_lead     FOREIGN KEY (lead_id)     REFERENCES leads(id) ON DELETE SET NULL,
      CONSTRAINT fk_task_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_task_creator  FOREIGN KEY (created_by)  REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("✅  Table: tasks");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      lead_id    INT UNSIGNED NOT NULL,
      content    TEXT         NOT NULL,
      created_by INT UNSIGNED NOT NULL,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_lead_id (lead_id),
      CONSTRAINT fk_note_lead FOREIGN KEY (lead_id)    REFERENCES leads(id) ON DELETE CASCADE,
      CONSTRAINT fk_note_user FOREIGN KEY (created_by) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: notes");

  console.log(" All tables created. Database is ready!\n");
  await conn.end();
  process.exit(0);
}

setupDb().catch((err) => {
  console.error("Setup failed:-- ", err.message, "\n");
  process.exit(1);
});