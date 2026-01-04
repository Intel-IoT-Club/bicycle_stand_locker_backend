require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Cycle = require('./models/Cycle');

const checkBikes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const bikes = await Cycle.find({});
        console.log(`Found ${bikes.length} bikes in global DB:`);
        bikes.forEach(b => {
            console.log(`- ID: ${b.cycleId}, Name: ${b.cycleName}, Owner: ${b.ownerID}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkBikes();
