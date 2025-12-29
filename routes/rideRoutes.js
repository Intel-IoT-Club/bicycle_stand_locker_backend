const express = require("express");
const router = express.Router();
const auth = require('../middlewares/authenticate.js');
const { createRide, listRides, getRide, updateRide, startRide, endRide, updateMetrics } = require('../controllers/ride');

// Create a ride (register + mark cycle unavailable if payment done)
router.post("/", auth, createRide);

// List rides (optional query params: bikeId, riderId, status, limit)
router.get("/", listRides);

// Get ride by id
router.get("/:id/get", getRide);

// Partial update ride
router.patch("/:id", updateRide);

// Start ride
router.post("/:id/start", auth, startRide);

// End ride
router.post("/:id/end", auth, endRide);

//Get fare
router.post("/:rideId/update-metrics", updateMetrics);

module.exports = router;
