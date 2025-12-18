const express = require("express");
const router = express.Router();
const {calculateFare} = require("../utils/fareCalculator");

router.post("/", async(req, res) => {
  const { distanceKm, bikeType,durationMinutes } = req.body;

  const fare = calculateFare({
    distanceKm,
    durationMinutes, 
    bikeType,
  });

  res.json({ fare });
});
module.exports = router;
