const Cycle = require('../models/Cycle');
const axios = require("axios");

exports.getAllCycles = async (req, res) => {
    try {
        const cycles = await Cycle.find();
        // console.log("All Cycles:", cycles);
        res.status(200).json({ data: cycles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAllCycles = async (req, res) => {
    try {
        const result = await Cycle.deleteMany({});
        console.log("Deleted Cycles:", result);
        res.status(200).json({ message: "All cycles deleted", deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getNearestCycles = async (req, res) => {
  const { boarding, destination } = req.body;

  if (!boarding) {
    return res.status(400).json({ error: "Boarding coordinates are required" });
  }

  if (!destination) {
    return res.status(400).json({ error: "Destination coordinates are required" });
  }

  try {
    const nearbyCycles = await Cycle.find({
      availabilityFlag: true, 
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [boarding.lng, boarding.lat],
          },
        },
      },
    }).limit(10);

    if (!nearbyCycles.length) {
      return res.status(200).json({ cycles: [] });
    }

    const orsKey = process.env.ORS_API_KEY;
    const orsBaseUrl = "https://api.openrouteservice.org/v2/matrix";

    // ------------------- WALKING MATRIX (boarding -> cycles) -------------------
    const walkingLocations = [
      [boarding.lng, boarding.lat],
      ...nearbyCycles.map((c) => c.location.coordinates),
    ];

    const walkingReq = axios.post(
      `${orsBaseUrl}/foot-walking`,
      {
        locations: walkingLocations,
        metrics: ["distance", "duration"],
      },
      {
        headers: {
          Authorization: orsKey,
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json, application/geo+json",
        },
      }
    );

    // ------------------- CYCLING MATRIX (cycles -> destination) -------------------
    const cyclingLocations = [
      ...nearbyCycles.map((c) => c.location.coordinates),
      [destination.lng, destination.lat],
    ];
    const destinationIndex = cyclingLocations.length - 1; // last index

    const cyclingReq = axios.post(
      `${orsBaseUrl}/cycling-regular`,
      {
        locations: cyclingLocations,
        metrics: ["distance", "duration"],
        sources: nearbyCycles.map((_, idx) => idx),
        destinations: [destinationIndex],
      },
      {
        headers: {
          Authorization: orsKey,
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json, application/geo+json",
        },
      }
    );

    const [walkingRes, cyclingRes] = await Promise.all([walkingReq, cyclingReq]);

    // Walking results
    const walkingDurations = walkingRes.data.durations[0].slice(1); // seconds
    const walkingDistances = walkingRes.data.distances[0].slice(1); // meters

    // Cycling results
    const rideDurations = cyclingRes.data.durations.map((row) => row[0]);
    const rideDistances = cyclingRes.data.distances.map((row) => row[0]);

    const cyclesWithETA = nearbyCycles.map((cycle, i) => {
      const walkDurationSec = walkingDurations[i];
      const walkDistanceM = walkingDistances[i];
      const rideDurationSec = rideDurations[i];
      const rideDistanceM = rideDistances[i];

      const walkMinutes = walkDurationSec / 60;
      const rideMinutes = rideDurationSec / 60;
      const walkKm = walkDistanceM / 1000;
      const rideKm = rideDistanceM / 1000;

      return {
        ...cycle.toObject(),

        // Walk (boarding → cycle)
        walkEtaMinutes: Number(walkMinutes.toFixed(2)),
        walkDistanceKm: Number(walkKm.toFixed(2)),

        // Ride (cycle → destination)
        rideEtaMinutes: Number(rideMinutes.toFixed(2)),
        rideDistanceKm: Number(rideKm.toFixed(2)),

        // Total journey
        totalTimeMinutes: Number((walkMinutes + rideMinutes).toFixed(2)),
        totalDistanceKm: Number((walkKm + rideKm).toFixed(2)),
      };
    });

    // Sort cycles by **total time** ascending
    cyclesWithETA.sort((a, b) => a.rideMinutes - b.totalTimeMinutes);

    res.status(200).json({ cycles: cyclesWithETA });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch matrix data" });
  }
};


exports.getBikeRoute = async (req, res) => {
  const { boarding, bike, destination } = req.body;
  console.log(boarding, bike, destination);

  if (!boarding || !destination) {
    return res.status(400).json({
      error: "boarding and destination are required"
    });
  }

  try {
    const orsKey = process.env.ORS_API_KEY;

    // Build coordinates dynamically
    const coordinates = [
      [boarding.lng, boarding.lat]
    ];

    // Only add bike if it exists
    if (bike?.location?.coordinates?.length === 2) {
      coordinates.push([
        bike.location.coordinates[0],
        bike.location.coordinates[1]
      ]);
    }

    coordinates.push([
      destination.lng,
      destination.lat
    ]);

    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
      { coordinates },
      {
        headers: {
          Authorization: orsKey,
          "Content-Type": "application/json",
          Accept: "application/json, application/geo+json"
        }
      }
    );

    const feature = response.data.features[0];
    const geometry = feature.geometry.coordinates;

    res.status(200).json({ geometry });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch route from ORS" });
  }
};


// Update a cycle (partial update allowed)
// Example: PATCH /api/cycles/:id  with body { availabilityFlag: false }
// Example: PATCH /api/cycles/:id  with body { status: "unlocked" }
exports.updateCycle = async (req, res) => {
  try {
    const cycleId = req.params.id || req.params.cycleId || req.body._id;
    if (!cycleId) {
      return res.status(400).json({ error: "Cycle id is required in URL param" });
    }

    const allowed = ["availabilityFlag", "status", "battery", "lastSeen", "location", "ownerID", "cycleName"];
    const updates = Object.keys(req.body);
    const isValidOp = updates.every((u) => allowed.includes(u));

    if (!isValidOp) {
      return res.status(400).json({ error: "Invalid fields in update. Allowed: " + allowed.join(", ") });
    }

    const updatePayload = {};
    updates.forEach((k) => (updatePayload[k] = req.body[k]));

    // If lastSeen provided as timestamp string/number, convert to Date
    if (updatePayload.lastSeen) {
      updatePayload.lastSeen = new Date(updatePayload.lastSeen);
    }

    const updated = await Cycle.findByIdAndUpdate(cycleId, updatePayload, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({ error: "Cycle not found" });
    }

    return res.status(200).json({ message: "Cycle updated", cycle: updated });
  } catch (error) {
    console.error("updateCycle error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.updateCycleLocation = async (req, res) => {
  const { lat, lng } = req.body;

  const cycle = await Cycle.findByIdAndUpdate(
    req.params.id,
    {
      location: {
        type: "Point",
        coordinates: [lng, lat]
      },
      lastSeen: new Date()
    },
    { new: true }
  );

  res.json({ cycle });
};

exports.getCycleLocation = async (req, res) => {
  const cycle = await Cycle.findById(req.params.id, "location lastSeen");

  if (!cycle) return res.status(404).json({ error: "Cycle not found" });

  res.json({
    location: {
      lat: cycle.location.coordinates[1],
      lng: cycle.location.coordinates[0]
    },
    lastSeen: cycle.lastSeen
  });
};
