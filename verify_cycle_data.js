const mongoose = require('mongoose');
require('dotenv').config();
const Cycle = require('./models/Cycle');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const targetId = "68e219a8619608a9fb03f738";

        console.log(`Searching for cycle with ID: ${targetId}`);

        // Try finding by _id
        let cycle = null;
        try {
            cycle = await Cycle.findById(targetId);
            if (cycle) console.log("Found by _id:", cycle);
        } catch (e) { console.log("Invalid ObjectId format for _id lookup"); }

        // Try finding by cycleId field
        const cycleByField = await Cycle.findOne({ cycleId: targetId });
        if (cycleByField) console.log("Found by cycleId field:", cycleByField);

        // List all cycles
        const allCycles = await Cycle.find({});
        console.log(`Total cycles in DB: ${allCycles.length}`);
        if (allCycles.length > 0 && !cycle && !cycleByField) {
            console.log("Sample cycle:", allCycles[0]);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
