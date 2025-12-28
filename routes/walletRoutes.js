const express = require("express");
const Wallet = require("../models/wallet");
const router = express.Router();

// Get wallet details
router.get("/:userId", async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.params.userId, balance: 0, transactions: [] });
    }
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update wallet settings (auto-recharge, threshold)
router.post("/:userId/settings", async (req, res) => {
  try {
    const { autoRecharge, lowBalanceThreshold } = req.body;
    let wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: req.params.userId });
    }
    if (autoRecharge !== undefined) wallet.autoRecharge = autoRecharge;
    if (lowBalanceThreshold !== undefined) wallet.lowBalanceThreshold = lowBalanceThreshold;
    await wallet.save();
    res.json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update/Set PIN
router.post("/:userId/pin", async (req, res) => {
  try {
    const { pin } = req.body;
    let wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: req.params.userId });
    }
    wallet.pin = pin; // Note: In production, hash this!
    await wallet.save();
    res.json({ success: true, message: "PIN updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pay using wallet balance
router.post("/:userId/pay", async (req, res) => {
  try {
    const { amount, rideId, pin } = req.body;
    const wallet = await Wallet.findOne({ userId: req.params.userId });

    if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found" });

    // Check PIN if set
    if (wallet.pin && wallet.pin !== pin) {
      return res.status(401).json({ success: false, message: "Incorrect PIN" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // Deduct balance
    wallet.balance -= amount;
    wallet.transactions.unshift({
      type: "Ride Charge",
      amount: amount,
      runningBalance: wallet.balance,
      date: new Date()
    });
    await wallet.save();

    // Update ride status if rideId is provided
    if (rideId) {
      const Ride = require("../models/Ride");
      const ride = await Ride.findById(rideId);
      if (ride) {
        if (!ride.payment) ride.payment = {};
        ride.payment.paid = true;
        ride.payment.method = "wallet";
        ride.status = "finished";
        ride.fare = amount;
        ride.finalFare = amount;
        await ride.save();

        // CREDIT THE OWNER
        if (ride.ownerId) {
          let ownerWallet = await Wallet.findOne({ userId: ride.ownerId });
          if (!ownerWallet) {
            ownerWallet = await Wallet.create({ userId: ride.ownerId, balance: 0 });
          }
          ownerWallet.balance += amount;
          ownerWallet.transactions.unshift({
            type: "Earnings",
            amount: amount,
            runningBalance: ownerWallet.balance,
            date: new Date()
          });
          await ownerWallet.save();

          // Sync Owner User Model
          const User = require("../models/User");
          await User.findByIdAndUpdate(ride.ownerId, { walletBalance: ownerWallet.balance }).catch(e => console.error("Sync Owner fail:", e));
        }
      }
    }

    // Sync Rider User Model
    const User = require("../models/User");
    await User.findByIdAndUpdate(req.params.userId, { walletBalance: wallet.balance }).catch(e => console.error("Sync Rider fail:", e));

    res.json({ success: true, balance: wallet.balance, message: "Payment successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Withdraw funds
router.post("/:userId/withdraw", async (req, res) => {
  try {
    const { amount, pin } = req.body;
    const wallet = await Wallet.findOne({ userId: req.params.userId });

    if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found" });

    // Verify PIN if exists
    if (wallet.pin && wallet.pin !== pin) {
      return res.status(401).json({ success: false, message: "Incorrect PIN" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // Process withdrawal
    wallet.balance -= amount;
    wallet.transactions.unshift({
      type: "Withdrawal",
      amount: -amount,
      runningBalance: wallet.balance,
      date: new Date()
    });
    await wallet.save();

    // Sync User model
    const User = require("../models/User");
    await User.findByIdAndUpdate(req.params.userId, { walletBalance: wallet.balance });

    res.json({ success: true, balance: wallet.balance, message: "Withdrawal successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Clear transactions
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