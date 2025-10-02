// models/Cycle.js
const mongoose = require('mongoose');

const CycleSchema = new mongoose.Schema({
    cycleName: { type: String },
    cycleId: { type: String, required: true, unique: true },
    ownerID: { type: String, required: true },
    status: { type: String, enum: ['locked', 'unlocked'], default: 'locked' },
    type: { type: String, enum: ['Geared', 'NonGeared'], required: true },
    battery: { type: Number, min: 0, max: 100 },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    lastSeen: { type: Date, default: Date.now },
    availabilityFlag: { type: Boolean, default: true }
});

module.exports = mongoose.model('Cycle', CycleSchema);
