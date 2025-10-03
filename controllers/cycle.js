const Cycle = require('../models/Cycle');

exports.bulkAddCycles = async (req, res) => {
    try {
        const cyclesArray = req.body;
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
  const { boarding, destination } = req.body; // boarding = { lat, lng }

  if (!boarding) {
    return res.status(400).json({ error: "Boarding coordinates are required" });
  }

  try {
    // Find cycles sorted by distance from boarding point
    const cycles = await Cycle.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [boarding.lng, boarding.lat] // MongoDB expects [lng, lat]
          }
        }
      }
    });

    res.status(200).json({ cycles: cycles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
