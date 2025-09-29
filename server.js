const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

app.use("/api/payments", paymentRoutes);
app.use("/api/wallet", walletRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));