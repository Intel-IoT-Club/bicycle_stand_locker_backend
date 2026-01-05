const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Wallet = require("../models/wallet");
const router = express.Router();
const Ride = require("../models/Ride");
const auth = require("../middlewares/authenticate");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET,
});

router.post("/create-order", auth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise and ensure integer
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };
    console.log("Creating Razorpay Order:", options);
    const order = await razorpay.orders.create(options);
    res.json({ order });
  } catch (err) {
    console.error("Razorpay Order Creation Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify", auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount } = req.body;
    console.log("PAYMENT VERIFY ATTEMPT:", { razorpay_order_id, razorpay_payment_id, userId, amount });

    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    console.log("Expected Signature:", expectedSignature);
    console.log("Received Signature:", razorpay_signature);

    if (expectedSignature === razorpay_signature) {
      let wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        wallet = new Wallet({ userId });
      }

      const rechargeAmount = Number(amount);
      const newBalance = wallet.balance + rechargeAmount;
      console.log(`Updating wallet for user ${userId}: ${wallet.balance} -> ${newBalance}`);

      const rechargeTx = {
        type: "Recharge",
        amount: rechargeAmount,
        runningBalance: newBalance,
        date: new Date(),
      };
      wallet.balance = newBalance;
      wallet.transactions.unshift(rechargeTx);

      if (rechargeAmount >= 500) {
        wallet.balance += 25;
        const cashbackTx = {
          type: "Cashback",
          amount: 25,
          runningBalance: wallet.balance,
          date: new Date(),
        };
        wallet.transactions.unshift(cashbackTx);
      }

      await wallet.save();

      // Update User Model
      const User = require("../models/User");
      await User.findByIdAndUpdate(userId, { walletBalance: wallet.balance }).catch(e => console.error("Sync user wallet fail:", e));

      console.log("Payment Verified Successfully");
      res.json({ success: true, message: "Payment verified successfully", wallet });
    } else {
      console.warn("Payment Verification FAILED: Signatures do not match");
      res.status(400).json({ success: false, message: "Verification failed" });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
router.post("/verifyPay", auth, async (req, res) => {
  try {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.response;
    const rideData = req.body.ride;

    console.log("RIDE PAYMENT VERIFYPAY ATTEMPT:", { razorpay_order_id, razorpay_payment_id, rideId: rideData?._id });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", secret)
      .update(sign.toString())
      .digest("hex");

    console.log("Expected Sign:", expectedSign);
    console.log("Received Sign:", razorpay_signature);

    if (expectedSign === razorpay_signature) {
      const rideId = rideData._id;
      const ride = await Ride.findById(rideId);

      if (!ride) {
        return res.status(404).json({ success: false, message: "Ride not found" });
      }

      ride.payment.paid = true;
      ride.fare = ride.payment.amount;
      ride.finalFare = ride.payment.amount;
      ride.status = req.body.status || "finished";
      await ride.save();

      // CREDIT THE OWNER
      if (ride.ownerId) {
        let ownerWallet = await Wallet.findOne({ userId: ride.ownerId });
        if (!ownerWallet) {
          ownerWallet = await Wallet.create({ userId: ride.ownerId, balance: 0 });
        }
        const amount = ride.payment.amount || 0;
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

      console.log("Ride Payment Verified Successfully");
      return res.status(200).json({ success: true, message: "Payment verified" });
    } else {
      console.warn("Ride Payment Verification FAILED: Signatures do not match");
      return res.status(400).json({ success: false, message: "Verification failed" });
    }
  } catch (error) {
    console.error("Error in verifyPay:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

module.exports = router;