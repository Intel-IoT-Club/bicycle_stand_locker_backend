const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const commandRoutes = require('./routes/commandRoutes');
const statusRoutes = require('./routes/statusRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const walletRoutes = require('./routes/walletRoutes');
const logRoutes = require('./routes/logRoutes');

const app = express();

// It is recommended to use the express-rate-limit middleware to protect against brute-force attacks.
// To use it, first install it: npm install express-rate-limit
// Then, uncomment the following lines:
// const rateLimit = require("express-rate-limit");
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// It is recommended to use the helmet middleware to set various HTTP headers to secure the app.
// To use helmet, first install it: npm install helmet
// Then, uncomment the following lines:
// const helmet = require("helmet");
// app.use(helmet());

// Security middleware
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' })); // Body limit is 10kb

// Configure CORS
app.use(cors({
  origin: [
    'https://bicycle-locker.vercel.app',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Database connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// API Routes
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

// API Routes
app.use("/api/command", commandRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/logs", logRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));