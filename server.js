const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");

const app = express();

// ---------- BASIC MIDDLEWARE ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

// ---------- SESSION CONFIG ----------
const sessionOptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "none",   // REQUIRED for cross-site cookies
    secure: true,       // REQUIRED for HTTPS (Vercel)
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

// ---------- CORS CONFIG (FIXED) ----------
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
].map(url => url ? url.replace(/\/$/, "") : url);

app.use(cors({
  origin: (origin, callback) => {
    console.log("CORS request from:", origin);

    // Allow Postman / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ CORS BLOCKED:", origin);
    console.log("✅ Allowed:", allowedOrigins);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// 🔥 THIS LINE FIXES VERCEL PREFLIGHT (CRITICAL)
app.options("*", cors());

// ---------- SESSION ----------
app.use(session(sessionOptions));

// ---------- DATABASE ----------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ---------- HEALTH CHECK ----------
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date(),
  });
});

// ---------- ROUTES ----------
const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");
const cycleRoutes = require("./routes/cycleRoutes");
const rideRoutes = require("./routes/rideRoutes");
const userRoutes = require("./routes/userRoutes");
const fareRoutes = require("./routes/fareRoutes");
const commandRoutes = require("./routes/commandRoutes");
const statusRoutes = require("./routes/statusRoutes");
const logRoutes = require("./routes/logRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");

app.use("/api/payments", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/cycles", cycleRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/fare", fareRoutes);
app.use("/api/command", commandRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/maintenance", maintenanceRoutes);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// ---------- ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: process.env.NODE_ENV === "production"
      ? "Something went wrong!"
      : err.message,
  });
});

// ---------- SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
