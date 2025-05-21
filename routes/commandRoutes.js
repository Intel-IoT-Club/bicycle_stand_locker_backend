// routes/commandRoutes.js
const express = require('express');
const router = express.Router();
const Command = require('../models/Command');

// POST /api/command - App sends command to lock/unlock
router.post('/', async (req, res) => {
    try {
        const { cycleId, command } = req.body;
        const newCommand = new Command({ cycleId, command });
        await newCommand.save();
        res.status(201).json({ message: 'Command saved successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save command' });
    }
});

// GET /api/command/:cycleId - ESP32 fetches latest command
router.get('/:cycleId', async (req, res) => {
    try {
        const { cycleId } = req.params;
        const command = await Command.findOne({ cycleId }).sort({ createdAt: -1 });
        if (!command) return res.status(404).json({ message: 'No command found' });
        res.json(command);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching command' });
    }
});

module.exports = router;
