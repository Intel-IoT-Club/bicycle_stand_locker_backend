// models/Log.js
const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    cycleId: { type: String, required: true },
    type: { type: String, enum: ['tamper', 'disconnect'], required: true },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);