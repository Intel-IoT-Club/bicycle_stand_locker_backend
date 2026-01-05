const mongoose = require('mongoose');
require('dotenv').config();
const Cycle = require('./models/Cycle');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const targetId = "68e219a8619608a9fb03f738";
        // Default location (New Delhi) or the one from user example (Bangalore)
        // User example was Bangalore (12.9716, 77.5946). Let's use that.
        const lat = 12.9716;
        const lng = 77.5946;

        const updateResult = await Cycle.updateMany(
            { cycleId: targetId },
            {
                $set: {
                    location: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    availabilityFlag: true, // Ensure it's available
                    status: 'locked'       // Ensure it's locked/ready
                }
            }
        );

        console.log("Update result:", updateResult);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
