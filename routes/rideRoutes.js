const express = require("express");
const router = express.Router();
const { createRide,listRides,getRide,updateRide,startRide,endRide } = require('../controllers/ride');

// Create a ride (register + mark cycle unavailable if payment done)
router.post("/", createRide);

// List rides (optional query params: bikeId, riderId, status, limit)
router.get("/", listRides);

// Get ride by id
router.get("/:id", getRide);

// Partial update ride
router.patch("/:id", updateRide);

// Start ride
router.post("/:id/start", startRide);

// End ride
router.post("/:id/end", endRide);

module.exports = router;
