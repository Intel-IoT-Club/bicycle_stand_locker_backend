const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
// app.set("trust proxy", 1);
const sessionOptions={
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        httpOnly:true,
        sameSite:"none",
        secure:true,
        domain:"localhost:3000",
        maxAge:7 * 24 * 60 * 60 * 1000,
    },
};
const allowedOrigins=[
    "http://localhost:5173",
    "http://localhost:5174",
    'https://bicycle-locker.vercel.app',
    'http://localhost:3000',
    process.env.FRONTEND_URL
]
app.use(cors({
    origin:(origin,callback)=>{
        console.log("CORS request from:", origin);
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
          console.log("CORS blocked request from:", origin);
        }
    },
    credentials:true
}))
app.use(session(sessionOptions));
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(" MongoDB Connected"))
  .catch(err => console.error(" MongoDB Error:", err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");
const cycleRoutes = require('./routes/cycleRoutes');
const rideRoutes=require('./routes/rideRoutes');
const userRoutes = require('./routes/userRoutes');
const fareRoutes = require('./routes/fareRoutes');
const commandRoutes = require('./routes/commandRoutes');
const statusRoutes = require('./routes/statusRoutes');
const logRoutes = require('./routes/logRoutes');

app.use("/api/payments", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/fare',fareRoutes)
app.use("/api/command", commandRoutes);
app.use("/api/status", statusRoutes);
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
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));