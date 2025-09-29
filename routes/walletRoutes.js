const express = require("express");
const Wallet = require("../models/wallet");
const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) {
      return res.json({ userId: req.params.userId, balance: 0, transactions: [] });
    }
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:userId/transactions", async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    if (wallet) {
      wallet.transactions = [];
      await wallet.save();
      res.json({ success: true, message: "Transaction history cleared", wallet });
    } else {
      res.status(404).json({ success: false, message: "Wallet not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;