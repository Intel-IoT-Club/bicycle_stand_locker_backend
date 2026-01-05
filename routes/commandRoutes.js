const express = require('express');
const router = express.Router();
const Command = require('../models/Command');
const auth = require('../middlewares/authenticate');

// POST /api/command - App sends command to lock/unlock
router.post('/', auth, async (req, res) => {
    try {
        const { cycleId, command } = req.body;

        if (!cycleId || !command) {
            return res.status(400).json({ error: 'cycleId and command are required' });
        }

        if (command !== 'lock' && command !== 'unlock') {
            return res.status(400).json({ error: 'command must be either "lock" or "unlock"' });
        }

        const newCommand = new Command({ cycleId, command });
        await newCommand.save();
        res.status(201).json({ message: 'Command saved successfully' });
    } catch (err) {
        console.error("Error saving command:", err);
        res.status(500).json({ error: 'Failed to save command' });
    }
});

// GET /api/command/device/:cycleId - Public endpoint for ESP32 to poll latest command
router.get('/device/:cycleId', async (req, res) => {
    try {
        const { cycleId } = req.params;
        // Fetch the very latest command for this cycle
        const command = await Command.findOne({ cycleId }).sort({ createdAt: -1 });

        // If no command found, default to 'lock' for safety, or return null
        if (!command) {
            return res.json({ command: 'lock' });
        }

        res.json({ command: command.command });
    } catch (err) {
        console.error("Error fetching device command:", err);
        res.status(500).json({ error: 'Error fetching command' });
    }
});

// GET /api/command/:cycleId - ESP32 fetches latest command
router.get('/:cycleId', auth, async (req, res) => {
    try {
        const { cycleId } = req.params;
        const command = await Command.findOne({ cycleId }).sort({ createdAt: -1 });
        if (!command) return res.status(404).json({ message: 'No command found' });
        res.json(command);
    } catch (err) {
        console.error("Error fetching command:", err);
        res.status(500).json({ error: 'Error fetching command' });
    }
});

// POST /api/command/device/:cycleId/status - ESP32 sends lock status
router.post('/device/:cycleId/status', async (req, res) => {
    try {
        const { cycleId } = req.params;
        const { status } = req.body; // Expect specific sensor value 1 (locked) or 0 (unlocked)

        const Cycle = require('../models/Cycle');
        const cycle = await Cycle.findOne({ cycleId });

        if (!cycle) {
            return res.status(404).json({ error: 'Cycle not found' });
        }

        // Map sensor value to status string
        // 1 -> locked, 0 -> unlocked
        cycle.status = status === 1 ? 'locked' : 'unlocked';
        cycle.lastSeen = Date.now();

        await cycle.save();

        res.json({ success: true, message: 'Status updated' });
    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ error: 'Error updating status' });
    }
});

module.exports = router;
