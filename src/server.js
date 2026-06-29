require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Global Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Personal Notes API is running 🚀",
    version: "1.0.0",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy.",
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// ---------------------------------------------------------------------------
// 404 Handler
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// ---------------------------------------------------------------------------
// Error Handler
// ---------------------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n⚡ Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}\n`);
});

module.exports = app;
