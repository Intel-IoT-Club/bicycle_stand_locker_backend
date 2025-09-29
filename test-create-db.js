require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    const user = await User.create({
      name: "Keerthi",
      email: "keerthi@example.com",
      balance: 100
    });

    console.log("🎉 User created:", user);
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

run();
