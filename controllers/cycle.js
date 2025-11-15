const Cycle = require('../models/Cycle');
const axios = require("axios");

exports.bulkAddCycles = async (req, res) => {
    try {
        const cyclesArray = req.body;
        const demoCyclesArrray = [ //To push in database for demo instead of cyclesArray
  {
    cycleName: "Firefox Ranger",
    cycleId: "C001",
    ownerID: "U001",
    status: "locked",
    type: "Geared",
    battery: 90,
    location: { type: "Point", coordinates: [76.900322, 10.899481] }, // Main Gate
    availabilityFlag: true
  },
  {
    cycleName: "Hero Lectro C1",
    cycleId: "C002",
    ownerID: "U002",
    status: "unlocked",
    type: "NonGeared",
    battery: 65,
    location: { type: "Point", coordinates: [76.903519, 10.900100] }, // Canteen area
    availabilityFlag: true
  },
  {
    cycleName: "Btwin Rockrider",
    cycleId: "C003",
    ownerID: "U003",
    status: "locked",
    type: "Geared",
    battery: 75,
    location: { type: "Point", coordinates: [76.903232, 10.900617] }, // AB1 Block
    availabilityFlag: true
  },
  {
    cycleName: "Montra Trance",
    cycleId: "C004",
    ownerID: "U004",
    status: "unlocked",
    type: "NonGeared",
    battery: 60,
    location: { type: "Point", coordinates: [76.898606, 10.903899] }, // AB2 Block
    availabilityFlag: true
  },
  {
    cycleName: "Trek Marlin 5",
    cycleId: "C005",
    ownerID: "U005",
    status: "locked",
    type: "Geared",
    battery: 80,
    location: { type: "Point", coordinates: [76.896986, 10.906581] }, // AB3 Block
    availabilityFlag: true
  },
  {
    cycleName: "Giant Escape 3",
    cycleId: "C006",
    ownerID: "U006",
    status: "locked",
    type: "NonGeared",
    battery: 50,
    location: { type: "Point", coordinates: [76.904847, 10.904308] }, // AB4 Block
    availabilityFlag: false
  },
  {
    cycleName: "Firefox Bad Attitude",
    cycleId: "C007",
    ownerID: "U007",
    status: "unlocked",
    type: "Geared",
    battery: 88,
    location: { type: "Point", coordinates: [76.899246, 10.904058] }, // Library
    availabilityFlag: true
  },
  {
    cycleName: "Hero Urban Trail",
    cycleId: "C008",
    ownerID: "U008",
    status: "locked",
    type: "NonGeared",
    battery: 40,
    location: { type: "Point", coordinates: [76.901207, 10.902244] }, // Amma shrine
    availabilityFlag: false
  },
  {
    cycleName: "Btwin Riverside 120",
    cycleId: "C009",
    ownerID: "U009",
    status: "locked",
    type: "Geared",
    battery: 92,
    location: { type: "Point", coordinates: [76.899785, 10.902458] }, // Gargi Bhavanam
    availabilityFlag: true
  },
  {
    cycleName: "Montra Helicon",
    cycleId: "C010",
    ownerID: "U010",
    status: "unlocked",
    type: "NonGeared",
    battery: 77,
    location: { type: "Point", coordinates: [76.896382, 10.902251] }, // Agasthya bhavanam
    availabilityFlag: true
  },
  {
    cycleName: "Hero Sprint Next",
    cycleId: "C011",
    ownerID: "U011",
    status: "locked",
    type: "Geared",
    battery: 66,
    location: { type: "Point", coordinates: [76.903055, 10.901843] }, // Playground
    availabilityFlag: true
  },
  {
    cycleName: "Btwin MyBike",
    cycleId: "C012",
    ownerID: "U012",
    status: "unlocked",
    type: "NonGeared",
    battery: 55,
    location: { type: "Point", coordinates: [76.902199, 10.904458] }, // MBA canteen
    availabilityFlag: true
  },
  {
    cycleName: "Firefox Voya",
    cycleId: "C013",
    ownerID: "U013",
    status: "locked",
    type: "Geared",
    battery: 82,
    location: { type: "Point", coordinates: [76.901493, 10.905557] }, // ASB 
    availabilityFlag: true
  },
  {
    cycleName: "Trek FX1",
    cycleId: "C014",
    ownerID: "U014",
    status: "locked",
    type: "NonGeared",
    battery: 47,
    location: { type: "Point", coordinates: [76.896233, 10.903362] }, // Agasthya/gauthama bhavanam mess hall
    availabilityFlag: false
  },
  {
    cycleName: "Hero Hawk Nuage",
    cycleId: "C015",
    ownerID: "U015",
    status: "unlocked",
    type: "Geared",
    battery: 89,
    location: { type: "Point", coordinates: [76.895541, 10.901870] }, //Vasishta bhavanam
    availabilityFlag: true
  },
  {
    cycleName: "Btwin Triban 100",
    cycleId: "C016",
    ownerID: "U016",
    status: "locked",
    type: "Geared",
    battery: 73,
    location: { type: "Point", coordinates: [76.894986, 10.901417] }, // Aarogya saadhanam boy's gym
    availabilityFlag: true
  },
  {
    cycleName: "Montra Blues",
    cycleId: "C017",
    ownerID: "U017",
    status: "locked",
    type: "NonGeared",
    battery: 68,
    location: { type: "Point", coordinates: [76.899447, 10.901539] }, // Guest House
    availabilityFlag: true
  },
  {
    cycleName: "Firefox Fusion",
    cycleId: "C018",
    ownerID: "U018",
    status: "unlocked",
    type: "Geared",
    battery: 81,
    location: { type: "Point", coordinates: [76.9029, 10.9038] }, // ASB Block
    availabilityFlag: true
  },
  {
    cycleName: "Giant Contend 3",
    cycleId: "C019",
    ownerID: "U019",
    status: "locked",
    type: "Geared",
    battery: 78,
    location: { type: "Point", coordinates: [76.899092, 10.907750] }, // Adithi Bhavanam
    availabilityFlag: true
  },
  {
    cycleName: "Hero Sprint RX2",
    cycleId: "C020",
    ownerID: "U020",
    status: "locked",
    type: "NonGeared",
    battery: 59,
    location: { type: "Point", coordinates: [76.899135, 10.905933] }, // Amritha university pool
    availabilityFlag: false
  }
];

        console.log("Received Cycles:", cyclesArray);

        if (!Array.isArray(cyclesArray) || cyclesArray.length === 0) {
            console.log("Invalid input: Not a non-empty array");
            return res.status(400).json({ error: "Request body must be a non-empty array of cycles." });
        }
        const result = await Cycle.insertMany(cyclesArray);
        const allCycles = await Cycle.find();
        // console.log("All Cycles in DB:", allCycles);
        res.status(201).json({
            message: "Bulk insert successful",
            insertedCount: result.length,
            totalCycles: allCycles.length
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

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
    cyclesWithETA.sort((a, b) => a.totalTimeMinutes - b.totalTimeMinutes);

    res.status(200).json({ cycles: cyclesWithETA });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch matrix data" });
  }
};


exports.getBikeRoute = async (req, res) => {
  const { boarding, bike, destination } = req.body;

  if (!boarding || !bike || !destination) {
    return res.status(400).json({ error: "boarding, bike, and destination are required" });
  }

  try {
    const orsKey = process.env.ORS_API_KEY;

    // ORS API call: Boarding -> Bike -> Destination
    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
      {
        coordinates: [
          [boarding.lng, boarding.lat],
          [bike.location.coordinates[0], bike.location.coordinates[1]],
          [destination.lng, destination.lat]
        ]
      },
      {
        headers: {
          Authorization: orsKey,
          "Content-Type": "application/json",
          "Accept": "application/json, application/geo+json"
        }
      }
    );

    const feature = response.data.features[0];
    const geometry = feature.geometry.coordinates; // full route coordinates

    res.status(200).json({geometry});

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
