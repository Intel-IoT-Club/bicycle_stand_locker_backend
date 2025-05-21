// models/Command.js
const mongoose = require('mongoose');

const CommandSchema = new mongoose.Schema({
    cycleId: { type: String, required: true },
    command: { type: String, enum: ['lock', 'unlock'], required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Command', CommandSchema);
