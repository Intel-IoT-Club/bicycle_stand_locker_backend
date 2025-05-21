const express = require('express');
const router = express.Router();
const Log = require('../models/Log'); // Adjust path if needed

// GET logs by cycleId
router.get('/:cycleId', async (req, res) => {
  try {
    const { cycleId } = req.params;
    const logs = await Log.find({ cycleId }).sort({ timestamp: -1 });
    if (!logs || logs.length === 0) {
      return res.status(404).json({ error: 'No logs found for this cycle' });
    }
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching logs' });
  }
});

// POST to create a new log entry manually (for testing)
router.post('/', async (req, res) => {
  try {
    const { cycleId, type, message, timestamp } = req.body;
    if (!cycleId || !type || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const logEntry = new Log({
      cycleId,
      type,
      message,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });
    await logEntry.save();
    res.status(201).json({ message: 'Log entry created', log: logEntry });
  } catch (error) {
    res.status(500).json({ error: 'Server error creating log' });
  }
});

module.exports = router;
