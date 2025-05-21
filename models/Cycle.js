// models/Cycle.js
const mongoose = require('mongoose');

const CycleSchema = new mongoose.Schema({
    cycleId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['locked', 'unlocked'], default: 'locked' },
    battery: { type: Number, min: 0, max: 100 },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cycle', CycleSchema);
