const Ride = require("../models/Ride");
const Cycle = require("../models/Cycle");
const { calculateFare } = require("../utils/fareCalculator");
const axios = require("axios");

//createRide
exports.createRide = async (req, res) => {
  const {
    bikeId,
    bikeName,
    boarding,
    destination,
    payment = { paid: false, amount: 0 },
    plannedDistanceKm,
    plannedDurationMin,
    meta = {},
  } = req.body;

  if (!bikeId || !boarding || !destination) {
    return res
      .status(400)
      .json({ error: "bikeId, boarding and destination are required" });
  }

  try {
    const cycle = await Cycle.findById(bikeId);
    if (!cycle) {
      return res.status(404).json({ error: "Bike not found" });
    }

    if (!cycle.availabilityFlag) {
      return res
        .status(409)
        .json({ error: "Bike is currently unavailable" });
    }

    const rideDoc = {
      bikeId,
      bikeName: bikeName || cycle.cycleName || "",
      riderId: req.user.id,
      boarding,
      destination,
      status: "started",
      payment, // in your new flow: { paid: false, method: 'postpaid', amount: <estimated> }
      plannedDistanceKm,
      plannedDurationMin,
      fare: payment.paid ? payment.amount || 0 : 0,
      meta,
    };

    const createdRide = await Ride.create({
      ...rideDoc,
      ownerId: cycle.ownerID // Capture the bike's owner
    });

    return res.status(201).json({ ride: createdRide });
  } catch (err) {
    console.error("createRide error:", err);
    return res.status(500).json({ error: "Failed to create ride" });
  }
};

//Get all rides
exports.listRides = async (req, res) => {
  try {
    const { bikeId, riderId, status } = req.query;

    const filter = {};
    if (bikeId) filter.bikeId = bikeId;
    if (riderId) filter.riderId = riderId;
    if (status) filter.status = status;

    const rides = await Ride.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ rides });

  } catch (err) {
    console.error("listRides error:", err);
    res.status(500).json({ error: err.message });
  }
};

//Get one ride
exports.getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate("bikeId");
    if (!ride) return res.status(404).json({ error: "Ride not found" });
    res.status(200).json({ ride });

  } catch (err) {
    console.error("getRide error:", err);
    res.status(500).json({ error: err.message });
  }
};

//Update ride (partial)
exports.updateRide = async (req, res) => {
  try {
    const allowed = ["status", "payment", "startedAt", "endedAt", "plannedDistanceKm", "plannedDurationMin", "fare", "meta"];
    const updates = Object.keys(req.body);

    const valid = updates.every((f) => allowed.includes(f));
    if (!valid) return res.status(400).json({ error: "Invalid fields in update" });

    const ride = await Ride.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!ride) return res.status(404).json({ error: "Ride not found" });

    res.status(200).json({ ride });

  } catch (err) {
    console.error("updateRide error:", err);
    res.status(500).json({ error: err.message });
  }
};

//Start ride
exports.startRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    ride.status = "started";
    ride.startedAt = new Date();
    await ride.save();

    await Cycle.findByIdAndUpdate(ride.bikeId, { availabilityFlag: false, status: "unlocked" });

    await axios.post(`${process.env.BACKEND_URL}/api/command`, {
      cycleId: ride.bikeId,
      command: "unlock",
    }, {
      headers: {
        Authorization: req.headers.authorization
      }
    });

    res.status(200).json({ ride });

  } catch (err) {
    console.error("startRide error:", err);
    res.status(500).json({ error: err.message });
  }
};

//End ride
// End Ride
// End Ride
exports.endRide = async (req, res) => {
  try {
    const { distanceKm, timeMin, endLocation } = req.body;

    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if (ride.status === "finished") {
      return res.status(400).json({ error: "Ride already ended" });
    }

    ride.status = "finished";
    ride.endedAt = new Date();
    ride.finalDistanceKm = distanceKm;
    ride.finalDurationMin = timeMin;
    ride.endLocation = endLocation;

    // Freeze final fare
    // Ensure the fare is calculated if not already set or updated
    // (Assuming updateMetrics was called, but let's be safe or just use ride.fare)
    ride.finalFare = ride.fare || 0;

    await ride.save();

    // ---------------------------------------------------------
    //  FINANCIAL TRANSACTION LOGIC
    // ---------------------------------------------------------

    // Only process payment if not already paid
    if (!ride.payment || !ride.payment.paid) {
      const Wallet = require("../models/wallet");

      // 1. DEDUCT FROM RIDER
      let riderWallet = await Wallet.findOne({ userId: ride.riderId });
      if (!riderWallet) {
        riderWallet = new Wallet({ userId: ride.riderId, balance: 0, transactions: [] });
      }

      riderWallet.balance -= ride.finalFare;
      riderWallet.transactions.push({
        type: "Ride Charge",
        amount: ride.finalFare,
        runningBalance: riderWallet.balance,
        date: new Date()
      });
      await riderWallet.save();

      // 2. ADD TO OWNER
      if (ride.ownerId) {
        let ownerWallet = await Wallet.findOne({ userId: ride.ownerId });
        if (!ownerWallet) {
          ownerWallet = new Wallet({ userId: ride.ownerId, balance: 0, transactions: [] });
        }
        ownerWallet.balance += ride.finalFare;
        ownerWallet.transactions.push({
          type: "Earnings",
          amount: ride.finalFare,
          runningBalance: ownerWallet.balance,
          date: new Date()
        });
        await ownerWallet.save();
      }

      // Mark as paid
      if (!ride.payment) ride.payment = {};
      ride.payment.paid = true;
      ride.payment.method = "wallet_auto";
      ride.payment.amount = ride.finalFare;
      await ride.save();
    }
    // ---------------------------------------------------------

    await Cycle.findByIdAndUpdate(ride.bikeId, {
      availabilityFlag: true,
      status: "locked"
    });

    await axios.post(`${process.env.BACKEND_URL}/api/command`, {
      cycleId: ride.bikeId,
      command: "lock",
    }, {
      headers: {
        Authorization: req.headers.authorization
      }
    });

    res.status(200).json({
      message: "Ride ended successfully",
      finalFare: ride.finalFare,
      ride
    });

  } catch (err) {
    console.error("endRide error:", err);
    res.status(500).json({ error: err.message });
  }
};


//Update fare
exports.updateMetrics = async (req, res) => {
  const { distanceKm, timeMin } = req.body;

  const ride = await Ride.findById(req.params.rideId);
  if (!ride) return res.status(404).json({ error: "Ride not found" });
  if (ride.status === "finished") {
    return res.status(400).json({ error: "Ride already ended" });
  }

  const fare = calculateFare({
    distanceKm,
    timeMin,
    bikeType: ride.bikeType || "Non-Geared",
  });

  ride.distanceKm = distanceKm;
  ride.timeMin = timeMin;
  ride.payment.amount = fare;

  await ride.save();

  res.json({ fare });
}