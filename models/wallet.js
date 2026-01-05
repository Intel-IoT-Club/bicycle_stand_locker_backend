const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const WalletSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ["Recharge", "Cashback", "Ride Charge", "Refund", "Earnings"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      runningBalance: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  pin: {
    type: String,
    default: null
  },
  autoRecharge: {
    type: Boolean,
    default: false
  },
  lowBalanceThreshold: {
    type: Number,
    default: 10
  }
});

// Hash PIN before saving
WalletSchema.pre("save", async function (next) {
  if (this.isModified("pin") && this.pin) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  next();
});

// Method to verify pin
WalletSchema.methods.verifyPin = async function (candidatePin) {
  if (!this.pin) return true; // No pin set, allow
  return await bcrypt.compare(candidatePin, this.pin);
};

module.exports = mongoose.model("Wallet", WalletSchema);