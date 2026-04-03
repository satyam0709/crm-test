const express  = require("express");
const { requireAuth } = require("@clerk/express");
const { clerkVerify } = require("../middleware/clerk-verify");

const {
  getReminders, createReminder, updateReminder, deleteReminder,
} = require("../controllers/reminderController");

const {
  getMeetings, createMeeting, deleteMeeting,
} = require("../controllers/meetingController");

const {
  getNotes, createNote, updateNote, deleteNote,
} = require("../controllers/noteController");

const {
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
} = require("../controllers/customerController");

const {
  getInvoices, createInvoice, updateInvoiceStatus, deleteInvoice,
} = require("../controllers/invoiceController");

const {
  getConversation, sendMessage, getUnreadCount,
} = require("../controllers/chatController");

const {
  getAttendance, markAttendance,
  getLeaves, createLeaveRequest, approveLeave, rejectLeave,
} = require("../controllers/hrController");

const {
  getPayroll, upsertPayroll, markPayrollPaid,
  getAppraisals, createAppraisal,
} = require("../controllers/hrOpsController");

const {
  getCompanySettings, updateCompanySettings,
  getIntegrations, toggleIntegration,
} = require("../controllers/settingsController");

const { getStorage }  = require("../controllers/storageController");
const { search }      = require("../controllers/searchController");

const auth = [requireAuth(), clerkVerify];

const router = express.Router();

// ── Search ───────────────────────────────────────────────────
router.get("/search", ...auth, search);

// ── Reminders ────────────────────────────────────────────────
router.get   ("/reminders",     ...auth, getReminders);
router.post  ("/reminders",     ...auth, createReminder);
router.patch ("/reminders/:id", ...auth, updateReminder);
router.delete("/reminders/:id", ...auth, deleteReminder);

// ── Meetings ─────────────────────────────────────────────────
router.get   ("/meetings",     ...auth, getMeetings);
router.post  ("/meetings",     ...auth, createMeeting);
router.delete("/meetings/:id", ...auth, deleteMeeting);

// ── Notes ────────────────────────────────────────────────────
router.get   ("/notes",     ...auth, getNotes);
router.post  ("/notes",     ...auth, createNote);
router.put   ("/notes/:id", ...auth, updateNote);
router.delete("/notes/:id", ...auth, deleteNote);

// ── Customers ────────────────────────────────────────────────
router.get   ("/customers",     ...auth, getCustomers);
router.post  ("/customers",     ...auth, createCustomer);
router.put   ("/customers/:id", ...auth, updateCustomer);
router.delete("/customers/:id", ...auth, deleteCustomer);

// ── Invoices ─────────────────────────────────────────────────
router.get   ("/invoices",            ...auth, getInvoices);
router.post  ("/invoices",            ...auth, createInvoice);
router.patch ("/invoices/:id/status", ...auth, updateInvoiceStatus);
router.delete("/invoices/:id",        ...auth, deleteInvoice);

// ── Chat ─────────────────────────────────────────────────────
router.get ("/chat/unread",       ...auth, getUnreadCount);
router.get ("/chat/:otherId",     ...auth, getConversation);
router.post("/chat",              ...auth, sendMessage);

// ── HR: Attendance ───────────────────────────────────────────
router.get ("/hr/attendance", ...auth, getAttendance);
router.post("/hr/attendance", ...auth, markAttendance);

// ── HR: Leaves ───────────────────────────────────────────────
router.get  ("/hr/leaves",              ...auth, getLeaves);
router.post ("/hr/leaves",              ...auth, createLeaveRequest);
router.patch("/hr/leaves/:id/approve",  ...auth, approveLeave);
router.patch("/hr/leaves/:id/reject",   ...auth, rejectLeave);

// ── HR Ops: Payroll ──────────────────────────────────────────
router.get  ("/hr-ops/payroll",          ...auth, getPayroll);
router.post ("/hr-ops/payroll",          ...auth, upsertPayroll);
router.patch("/hr-ops/payroll/:id/paid", ...auth, markPayrollPaid);

// ── HR Ops: Appraisals ───────────────────────────────────────
router.get ("/hr-ops/appraisals", ...auth, getAppraisals);
router.post("/hr-ops/appraisals", ...auth, createAppraisal);

// ── Settings: Company ────────────────────────────────────────
router.get("/settings/company", ...auth, getCompanySettings);
router.put("/settings/company", ...auth, updateCompanySettings);

// ── Settings: Integrations ───────────────────────────────────
router.get ("/integrations",             ...auth, getIntegrations);
router.post("/integrations/:key/toggle", ...auth, toggleIntegration);

// ── Storage ──────────────────────────────────────────────────
router.get("/storage", ...auth, getStorage);

module.exports = router;