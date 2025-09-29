const razorpay = require("../config/razorpay");
const Transaction = require("../models/Transaction");

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount required" });

    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    await Transaction.create({ orderId: order.id, amount });

    res.json({ orderId: order.id, amount: options.amount, currency: options.currency });
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, status } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { orderId },
      { paymentId, status },
      { new: true }
    );

    res.json({ success: true, transaction });
  } catch (err) {
    console.error("❌ Payment verification failed:", err);
    res.status(500).json({ error: err.message });
  }
};
