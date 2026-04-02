require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { clerkMiddleware } = require("@clerk/express");

const { testConnection } = require("./config/database");
const routes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean).map(o => o.replace(/\/$/, ""));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));


app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { success: false, message: "Too many requests. Try again later." },
}));

app.use("/api/webhook/clerk", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(clerkMiddleware());

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use((err, _req, res, _next) => {
  console.error("Server error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n🚀  API → http://localhost:${PORT}/api/health\n`);
  });
}

start();