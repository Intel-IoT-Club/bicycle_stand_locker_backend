const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Wallet = require("../models/wallet");
const router = express.Router();
const Ride = require("../models/Ride");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      let wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        wallet = new Wallet({ userId });
      }

      const newBalance = wallet.balance + amount;
      const rechargeTx = {
        type: "Recharge",
        amount: amount,
        date: new Date(),
      };
      wallet.balance = newBalance;
      wallet.transactions.unshift(rechargeTx);

      if (amount >= 500) {
        const cashbackTx = {
          type: "Cashback",
          amount: 25,
          date: new Date(),
        };
        wallet.balance += 25;
        wallet.transactions.unshift(cashbackTx);
      }

      await wallet.save();
      res.json({ success: true, message: "Payment verified successfully", wallet });
    } else {
      res.status(400).json({ success: false, message: "Verification failed" });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
router.post("/verifyPay", async (req, res) => {
  try {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.response;
    const rideData = req.body.ride;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      const rideId = rideData._id;
      const ride = await Ride.findById(rideId);

      if (!ride) {
        return res.status(404).json({ success: false, message: "Ride not found" });
      }

      ride.payment.paid = true;
      ride.fare = ride.payment.amount;
      ride.finalFare = ride.payment.amount;
      ride.status = "finished";
      await ride.save();

      return res.status(200).json({ success: true, message: "Payment verified" });
    } else {
      return res.status(400).json({ success: false, message: "Verification failed" });
    }
  } catch (error) {
    console.error("Error in verifyPay:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

module.exports = router;