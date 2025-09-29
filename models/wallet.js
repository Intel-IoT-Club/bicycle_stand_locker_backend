const mongoose = require("mongoose");

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
        enum: ["Recharge", "Cashback", "Ride Charge", "Refund"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Wallet", WalletSchema);