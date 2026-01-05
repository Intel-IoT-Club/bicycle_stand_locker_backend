const Cycle = require('../models/Cycle');
const Log = require('../models/Log');

exports.updateStatus = async (req, res) => {
    try {
        const { cycleId, battery, location, tamper, status } = req.body;
        const mongoose = require('mongoose');

        if (!cycleId) {
            return res.status(400).json({ error: 'cycleId is required' });
        }

        const updateFields = {
            lastSeen: new Date()
        };

        if (battery !== undefined) updateFields.battery = battery;
        if (location !== undefined) {
            if (location.lat && location.lng) {
                updateFields.location = {
                    type: 'Point',
                    coordinates: [location.lng, location.lat]
                };
            } else {
                updateFields.location = location;
            }
        }
        if (status !== undefined) {
            if (['locked', 'unlocked'].includes(status)) {
                updateFields.status = status;
                // Automatically update availability based on lock status
                // Unlocked (In Use) -> Not Available
                // Locked (Idle) -> Available
                updateFields.availabilityFlag = (status === 'locked');
            }
        }

        // Build query to find by _id OR cycleId
        const query = { $or: [{ cycleId: cycleId }] };
        if (mongoose.Types.ObjectId.isValid(cycleId)) {
            query.$or.push({ _id: cycleId });
        }

        // Update cycle status
        const updatedCycle = await Cycle.findOneAndUpdate(
            query,
            updateFields,
            { new: true } // Removed upsert: true to prevent ghost cycling
        );

        if (!updatedCycle) {
            return res.status(404).json({ error: 'Cycle not found' });
        }

        // Log tamper if present and true
        if (tamper) {
            const newLog = new Log({ cycleId: updatedCycle.cycleId, type: 'tamper', message: 'Tamper detected' });
            await newLog.save();
        }

        res.json({ message: 'Status updated', cycle: updatedCycle });
    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

exports.getStatus = async (req, res) => {
    try {
        const cycle = await Cycle.findOne({ cycleId: req.params.cycleId });
        if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
        res.json(cycle);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching status' });
    }
};
