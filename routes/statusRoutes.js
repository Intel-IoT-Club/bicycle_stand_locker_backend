// routes/statusRoutes.js
const express = require('express');
const router = express.Router();
const Cycle = require('../models/Cycle');
const Log = require('../models/Log');

// POST /api/status - ESP32 sends battery, location, tamper
router.post('/', async (req, res) => {
    try {
        const { cycleId, battery, location, tamper } = req.body;

        // Update cycle status
        await Cycle.findOneAndUpdate(
            { cycleId },
            {
                battery,
                location,
                lastSeen: new Date()
            },
            { upsert: true, new: true }
        );

        // Log tamper if present
        if (tamper) {
            const newLog = new Log({ cycleId, type: 'tamper', message: 'Tamper detected' });
            await newLog.save();
        }

        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// GET /api/status/:cycleId - App fetches cycle status
router.get('/:cycleId', async (req, res) => {
    try {
        const cycle = await Cycle.findOne({ cycleId: req.params.cycleId });
        if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
        res.json(cycle);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching status' });
    }
});

module.exports = router;