const Cycle = require('../models/Cycle');
const Ride = require('../models/Ride');
const Wallet = require('../models/wallet');

// Get all bikes for current owner
exports.getOwnerBikes = async (req, res) => {
    try {
        const bikes = await Cycle.find({ ownerID: req.user.id });
        res.status(200).json({ success: true, bikes });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get current live rides for owner's bikes
exports.getOwnerLiveRides = async (req, res) => {
    try {
        const rides = await Ride.find({
            ownerId: req.user.id,
            status: 'started'
        }).populate('riderId', 'userName email phone');

        res.status(200).json({ success: true, rides });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get earnings and stats for owner dashboard
exports.getOwnerDashboardStats = async (req, res) => {
    try {
        const ownerId = req.user.id;

        // 1. Basic counts
        const bikes = await Cycle.find({ ownerID: ownerId });
        const totalBikes = bikes.length;
        const activeBikes = bikes.filter(b => b.availabilityFlag).length;

        // 2. Earnings from Rides
        const finishedRides = await Ride.find({
            ownerId: ownerId,
            status: 'finished'
        });

        const totalEarnings = finishedRides.reduce((acc, ride) => acc + (ride.finalFare || 0), 0);
        const totalRides = finishedRides.length;

        // 3. Current Live Rides count
        const liveRidesCount = await Ride.countDocuments({
            ownerId: ownerId,
            status: 'started'
        });

        // 4. Wallet Balance (Earnings available)
        let wallet = await Wallet.findOne({ userId: ownerId });
        if (!wallet) {
            wallet = await Wallet.create({ userId: ownerId, balance: 0 });
        }

        res.status(200).json({
            success: true,
            stats: {
                totalBikes,
                activeBikes,
                totalEarnings,
                totalRides,
                liveRidesCount,
                walletBalance: wallet.balance
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get all users in the system (for owner management)
exports.getOwnerUsers = async (req, res) => {
    try {
        const User = require('../models/User');
        const users = await User.find({}, 'userName email phone role createdAt walletBalance');

        // Enhance with wallet data if needed (already in user.walletBalance if synced)
        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Toggle Bike Availability
exports.toggleBikeAvailability = async (req, res) => {
    try {
        const { bikeId } = req.params;
        const bike = await Cycle.findOne({ _id: bikeId, ownerID: req.user.id });

        if (!bike) {
            return res.status(404).json({ success: false, message: "Bike not found or you don't own it" });
        }

        bike.availabilityFlag = !bike.availabilityFlag;
        await bike.save();

        res.status(200).json({
            success: true,
            message: `Bike is now ${bike.availabilityFlag ? 'visible' : 'hidden'} to riders`,
            availability: bike.availabilityFlag
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
// Register a new bike unit
exports.registerCycle = async (req, res) => {
    try {
        const { cycleName, cycleId, type, location } = req.body;

        if (!cycleId || !type || !location) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Check if cycleId already exists
        const existing = await Cycle.findOne({ cycleId });
        if (existing) {
            return res.status(409).json({ success: false, message: "Cycle ID already registered" });
        }

        const newBike = new Cycle({
            cycleName,
            cycleId,
            type,
            location,
            ownerID: req.user.id,
            availabilityFlag: true,
            status: 'locked'
        });

        await newBike.save();

        res.status(201).json({
            success: true,
            message: "Unit registered successfully",
            bike: newBike
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Delete a bike unit
exports.deleteCycle = async (req, res) => {
    try {
        const { bikeId } = req.params;
        const bike = await Cycle.findOneAndDelete({ _id: bikeId, ownerID: req.user.id });

        if (!bike) {
            return res.status(404).json({ success: false, message: "Bike not found or unauthorized" });
        }

        res.status(200).json({ success: true, message: "Bike unit removed successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Delete ALL bikes for the current owner
exports.deleteAllCycles = async (req, res) => {
    try {
        const result = await Cycle.deleteMany({ ownerID: req.user.id });
        res.status(200).json({
            success: true,
            message: `Removed all ${result.deletedCount} units from your fleet.`
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get Owner Wallet Data (Transactions, Bank Details)
exports.getOwnerWalletData = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const User = require('../models/User');

        // 1. Fetch Rides (Transactions)
        const rides = await Ride.find({ ownerId }).sort({ createdAt: -1 }).populate('riderId', 'userName email phone');

        // 2. Fetch Wallet Balance
        let wallet = await Wallet.findOne({ userId: ownerId });
        if (!wallet) {
            wallet = await Wallet.create({ userId: ownerId, balance: 0 });
        }

        // 3. Fetch Bank Details
        const user = await User.findById(ownerId, 'bankDetails');

        res.status(200).json({
            success: true,
            rides,
            walletBalance: wallet.balance,
            bankDetails: user.bankDetails || {}
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update Bank Details
exports.updateBankDetails = async (req, res) => {
    try {
        const { accountName, accountNumber, ifsc, bankName } = req.body;
        const User = require('../models/User');

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.bankDetails = {
            accountName,
            accountNumber,
            ifsc,
            bankName
        };

        await user.save();

        res.status(200).json({ success: true, message: "Bank details updated", bankDetails: user.bankDetails });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
