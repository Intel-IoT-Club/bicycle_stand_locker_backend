const Cycle = require('../models/Cycle');
const Log = require('../models/Log');

exports.updateStatus = async (req, res) => {
    try {
        const { cycleId, battery, location, tamper, status } = req.body;

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
            }
        }

        // Update cycle status
        const updatedCycle = await Cycle.findOneAndUpdate(
            { cycleId },
            updateFields,
            { upsert: true, new: true } // Upsert might not be desired if we only want to log for existing cycles, but keeping existing behavior
        );

        // Log tamper if present and true
        if (tamper) {
            const newLog = new Log({ cycleId, type: 'tamper', message: 'Tamper detected' });
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
