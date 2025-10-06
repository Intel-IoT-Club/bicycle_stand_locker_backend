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
  const { boarding } = req.body;

  if (!boarding) {
    return res.status(400).json({ error: "Boarding coordinates are required" });
  }

  try {
    const nearbyCycles = await Cycle.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [boarding.lng, boarding.lat],
          },
        },
      },
    }).limit(10);

    if (!nearbyCycles.length)
      return res.status(200).json({ cycles: [] });

    const locations = [
      [boarding.lng, boarding.lat],
      ...nearbyCycles.map(c => c.location.coordinates),
    ];

    const orsKey = process.env.ORS_API_KEY;
    const matrixRes = await axios.post(
      "https://api.openrouteservice.org/v2/matrix/foot-walking",
      {
        locations,
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

    // Extract values correctly (skip first element = origin→origin)
    const durations = matrixRes.data.durations[0].slice(1);
    const distances = matrixRes.data.distances[0].slice(1);

    const cyclesWithETA = nearbyCycles.map((cycle, i) => ({
      ...cycle.toObject(),
      etaMinutes: Math.round(durations[i] / 60).toFixed(2),
      distanceKm: (distances[i] / 1000).toFixed(2),
    }));

    // Sort by ETA, not raw distance
    cyclesWithETA.sort((a, b) => a.etaMinutes - b.etaMinutes);

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
      "https://api.openrouteservice.org/v2/directions/cycling-regular/geojson",
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
    const summary = feature.properties.summary;
    const geometry = feature.geometry.coordinates; // full route coordinates
    const distanceKm = (summary.distance / 1000).toFixed(2);
    const durationMin = Math.round(summary.duration / 60);

    res.status(200).json({
      geometry,
      distanceKm,
      durationMin
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch route from ORS" });
  }
};
