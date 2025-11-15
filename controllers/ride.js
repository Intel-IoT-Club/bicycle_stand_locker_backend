const Ride = require("../models/Ride");
const Cycle = require("../models/Cycle");

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
    riderId,
    meta = {},
  } = req.body;

  if (!bikeId || !boarding || !destination) {
    return res
      .status(400)
      .json({ error: "bikeId, boarding and destination are required" });
  }
  if (!riderId) {
    return res.status(400).json({ error: "riderId is required" });
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
      riderId: String(riderId),
      boarding,
      destination,
      startRequestedAt: new Date(),
      status: "started",
      payment, // in your new flow: { paid: false, method: 'postpaid', amount: <estimated> }
      plannedDistanceKm,
      plannedDurationMin,
      fare: payment.paid ? payment.amount || 0 : 0,
      meta,
    };

    const createdRide = await Ride.create(rideDoc);

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

    await Cycle.findByIdAndUpdate(ride.bikeId, { availabilityFlag:"false", status: "unlocked" });

    res.status(200).json({ ride });

  } catch (err) {
    console.error("startRide error:", err);
    res.status(500).json({ error: err.message });
  }
};

//End ride
exports.endRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    ride.status = "finished";
    ride.endedAt = new Date();
    await ride.save();

    await Cycle.findByIdAndUpdate(ride.bikeId, {
      availabilityFlag: true,
      status: "locked"
    });

    res.status(200).json({ ride });

  } catch (err) {
    console.error("endRide error:", err);
    res.status(500).json({ error: err.message });
  }
};