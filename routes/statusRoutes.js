// routes/statusRoutes.js
const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

// POST /api/status - ESP32 sends battery, location, tamper, status
router.post('/', statusController.updateStatus);

// GET /api/status/:cycleId - App fetches cycle status
router.get('/:cycleId', statusController.getStatus);

module.exports = router;