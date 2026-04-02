const express = require("express");
const { requireAuth } = require("@clerk/express");
const { handleClerkWebhook } = require("../controllers/webhookController");
const { getMe } = require("../controllers/userController");
const { submitContact, getContacts, markAsRead } = require("../controllers/contactController");
const { clerkVerify } = require("../middleware/clerk-verify");
const leadsRouter = require("./leads");
const tasksRouter = require("./tasks");
const usersRouter = require("./users");
const dashboardRouter = require("./dashboard");
const integrationsRouter = require("./integrations");

const router = express.Router();

router.get("/health", (_req, res) =>
  res.json({
    status: "ok",
    message: "RND TECHNOSOFT API is running",
    timestamp: new Date().toISOString(),
  })
);

router.post("/webhook/clerk", handleClerkWebhook);

router.get("/users/me", requireAuth(), clerkVerify, getMe);
router.use("/users", usersRouter);
router.use("/leads", leadsRouter);
router.use("/tasks", tasksRouter);
router.use("/dashboard", dashboardRouter);
router.use("/integrations", integrationsRouter);

router.post("/contact", submitContact);
router.get("/contact", requireAuth(), clerkVerify, getContacts);
router.patch("/contact/:id/read", requireAuth(), clerkVerify, markAsRead);

module.exports = router;