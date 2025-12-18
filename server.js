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

const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");
const cycleRoutes = require('./routes/cycleRoutes');
const rideRoutes=require('./routes/rideRoutes');
const userRoutes = require('./routes/userRoutes');
const fareRoutes = require('./routes/fareRoutes');

app.use("/api/payments", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/fare',fareRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));