const express = require('express');
const router = express.Router();
const Command = require('../models/Command');
const authMiddleware = require('../middleware/auth');

// POST /api/command - App sends command to lock/unlock
router.post('/', authMiddleware, async (req, res) => {
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

// GET /api/command/:cycleId - ESP32 fetches latest command
router.get('/:cycleId', authMiddleware, async (req, res) => {
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

module.exports = router;
