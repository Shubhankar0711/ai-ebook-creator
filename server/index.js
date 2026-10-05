const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const authRoutes    = require("./routes/auth.routes");
const bookRoutes    = require("./routes/book.routes");
const chapterRoutes = require("./routes/chapter.routes");
const aiRoutes      = require("./routes/ai.routes");
const exportRoutes  = require("./routes/export.routes");
const userRoutes    = require("./routes/user.routes");
const paymentRoutes = require("./routes/payment.routes");
const teamRoutes    = require("./routes/team.routes");
const adminRoutes   = require("./routes/admin.routes");
const contactRoutes = require("./routes/contact.routes");

const app = express();

// Security Middleware
app.use(helmet());
app.use(morgan("combined"));

// Rate Limiting — generous for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 20 : 100,
  message: { success: false, message: "Too many AI requests, please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);
app.use("/api/ai/", aiLimiter);

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-razorpay-signature"],
  })
);

// Raw body parser for webhook signature validation (must run before express.json)
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Standard body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth",     authRoutes);
app.use("/api/books",    bookRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/ai",       aiRoutes);
app.use("/api/export",   exportRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/team",     teamRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/contact",  contactRoutes);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler caught:", err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Connect to MongoDB and Start Server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("✅ MongoDB connected successfully");
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📖 AI Provider: ${process.env.AI_PROVIDER || "groq"}`);
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
      process.exit(1);
    });
}

module.exports = app;
