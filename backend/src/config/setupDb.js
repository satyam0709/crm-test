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

  console.log(`\n Setting up database: ${DB}\n`);

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${DB}\``);

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
  console.log("Table: tasks");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      lead_id    INT UNSIGNED DEFAULT NULL,
      title      VARCHAR(200) DEFAULT NULL,
      content    TEXT         NOT NULL,
      created_by INT UNSIGNED NOT NULL,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_lead_id    (lead_id),
      KEY idx_created_by (created_by),
      CONSTRAINT fk_note_lead FOREIGN KEY (lead_id)    REFERENCES leads(id) ON DELETE CASCADE,
      CONSTRAINT fk_note_user FOREIGN KEY (created_by) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: notes");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      user_id       VARCHAR(255) NOT NULL,
      package_name  VARCHAR(100) DEFAULT NULL,
      package_price DECIMAL(10,2) DEFAULT 0,
      currency      VARCHAR(10)  DEFAULT 'INR',
      addons        JSON,
      subtotal      DECIMAL(10,2) DEFAULT 0,
      gst           DECIMAL(10,2) DEFAULT 0,
      total         DECIMAL(10,2) DEFAULT 0,
      status        VARCHAR(50)  DEFAULT 'trial',
      created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: orders");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS reminders (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id    INT UNSIGNED NOT NULL,
      title      VARCHAR(200) NOT NULL,
      note       TEXT         DEFAULT NULL,
      remind_at  DATETIME     NOT NULL,
      lead_id    INT UNSIGNED DEFAULT NULL,
      is_done    TINYINT(1)   NOT NULL DEFAULT 0,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_user_id (user_id),
      KEY idx_remind_at (remind_at),
      CONSTRAINT fk_reminder_user FOREIGN KEY (user_id)  REFERENCES users(id),
      CONSTRAINT fk_reminder_lead FOREIGN KEY (lead_id)  REFERENCES leads(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: reminders");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS meetings (
      id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
      title        VARCHAR(200) NOT NULL,
      description  TEXT         DEFAULT NULL,
      start_time   DATETIME     NOT NULL,
      end_time     DATETIME     DEFAULT NULL,
      location     VARCHAR(300) DEFAULT NULL,
      meet_link    VARCHAR(500) DEFAULT NULL,
      organizer_id INT UNSIGNED NOT NULL,
      lead_id      INT UNSIGNED DEFAULT NULL,
      created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_organizer (organizer_id),
      KEY idx_start_time (start_time),
      CONSTRAINT fk_meeting_organizer FOREIGN KEY (organizer_id) REFERENCES users(id),
      CONSTRAINT fk_meeting_lead      FOREIGN KEY (lead_id)      REFERENCES leads(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: meetings");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS meeting_attendees (
      meeting_id INT UNSIGNED NOT NULL,
      user_id    INT UNSIGNED NOT NULL,
      PRIMARY KEY (meeting_id, user_id),
      CONSTRAINT fk_ma_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
      CONSTRAINT fk_ma_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: meeting_attendees");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(150) DEFAULT NULL,
      phone      VARCHAR(20)  DEFAULT NULL,
      company    VARCHAR(150) DEFAULT NULL,
      city       VARCHAR(100) DEFAULT NULL,
      country    VARCHAR(100) DEFAULT 'India',
      lead_id    INT UNSIGNED DEFAULT NULL,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_name (name),
      CONSTRAINT fk_customer_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: customers");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
      invoice_number VARCHAR(50)  NOT NULL UNIQUE,
      type           ENUM('sales','purchase','proforma') NOT NULL DEFAULT 'sales',
      customer_name  VARCHAR(150) DEFAULT NULL,
      customer_email VARCHAR(150) DEFAULT NULL,
      vendor_name    VARCHAR(150) DEFAULT NULL,
      invoice_date   DATE         NOT NULL,
      due_date       DATE         DEFAULT NULL,
      subtotal       DECIMAL(12,2) DEFAULT 0,
      tax            DECIMAL(12,2) DEFAULT 0,
      total          DECIMAL(12,2) DEFAULT 0,
      status         ENUM('draft','sent','paid','cancelled') NOT NULL DEFAULT 'draft',
      notes          TEXT         DEFAULT NULL,
      created_by     INT UNSIGNED DEFAULT NULL,
      created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_type   (type),
      KEY idx_status (status),
      CONSTRAINT fk_invoice_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: invoices");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      sender_id   INT UNSIGNED NOT NULL,
      receiver_id INT UNSIGNED NOT NULL,
      body        TEXT         NOT NULL,
      is_read     TINYINT(1)   NOT NULL DEFAULT 0,
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_sender   (sender_id),
      KEY idx_receiver (receiver_id),
      CONSTRAINT fk_msg_sender   FOREIGN KEY (sender_id)   REFERENCES users(id),
      CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: chat_messages");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id    INT UNSIGNED NOT NULL,
      date       DATE         NOT NULL,
      check_in   TIME         DEFAULT NULL,
      check_out  TIME         DEFAULT NULL,
      status     ENUM('present','absent','half_day','leave') NOT NULL DEFAULT 'present',
      note       TEXT         DEFAULT NULL,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_user_date (user_id, date),
      CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: attendance");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id     INT UNSIGNED NOT NULL,
      leave_type  ENUM('annual','sick','personal','other') NOT NULL DEFAULT 'annual',
      from_date   DATE         NOT NULL,
      to_date     DATE         NOT NULL,
      days        INT          NOT NULL DEFAULT 1,
      reason      TEXT         DEFAULT NULL,
      status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
      approved_by INT UNSIGNED DEFAULT NULL,
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_leave_user     FOREIGN KEY (user_id)     REFERENCES users(id),
      CONSTRAINT fk_leave_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: leave_requests");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS payroll (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id     INT UNSIGNED NOT NULL,
      month       TINYINT      NOT NULL,
      year        YEAR         NOT NULL,
      basic       DECIMAL(10,2) DEFAULT 0,
      allowances  DECIMAL(10,2) DEFAULT 0,
      deductions  DECIMAL(10,2) DEFAULT 0,
      net         DECIMAL(10,2) DEFAULT 0,
      paid_at     DATETIME     DEFAULT NULL,
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_user_month_year (user_id, month, year),
      CONSTRAINT fk_payroll_user FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: payroll");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS appraisals (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id    INT UNSIGNED NOT NULL,
      period     VARCHAR(50)  NOT NULL,
      rating     DECIMAL(3,1) NOT NULL,
      comments   TEXT         DEFAULT NULL,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_appraisal_user FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: appraisals");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id           INT UNSIGNED NOT NULL DEFAULT 1,
      company_name VARCHAR(200) DEFAULT NULL,
      website      VARCHAR(300) DEFAULT NULL,
      phone        VARCHAR(20)  DEFAULT NULL,
      email        VARCHAR(150) DEFAULT NULL,
      address      TEXT         DEFAULT NULL,
      city         VARCHAR(100) DEFAULT NULL,
      state        VARCHAR(100) DEFAULT NULL,
      country      VARCHAR(100) DEFAULT 'India',
      gst_number   VARCHAR(50)  DEFAULT NULL,
      pan_number   VARCHAR(50)  DEFAULT NULL,
      updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: company_settings");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS integrations (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`key\`    VARCHAR(100) NOT NULL UNIQUE,
      name       VARCHAR(200) NOT NULL,
      is_active  TINYINT(1)   NOT NULL DEFAULT 0,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: integrations");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS file_attachments (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id    INT UNSIGNED NOT NULL,
      lead_id    INT UNSIGNED DEFAULT NULL,
      file_name  VARCHAR(300) NOT NULL,
      file_url   VARCHAR(1000) NOT NULL,
      size_bytes INT UNSIGNED DEFAULT 0,
      mime_type  VARCHAR(100) DEFAULT NULL,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_fa_user FOREIGN KEY (user_id) REFERENCES users(id),
      CONSTRAINT fk_fa_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("Table: file_attachments");

  console.log("\n All tables created. Database is ready!\n");
  await conn.end();
  process.exit(0);
}

setupDb().catch((err) => {
  console.error("Setup failed:", err.message, "\n");
  process.exit(1);
});