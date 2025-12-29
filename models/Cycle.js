const mongoose = require('mongoose');

const CycleSchema = new mongoose.Schema({
    cycleName: { type: String },
    cycleId: { type: String, required: true, unique: true },
    ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['locked', 'unlocked'], default: 'locked' },
    type: { type: String, enum: ['Geared', 'NonGeared'], required: true },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        }
    },
    lastSeen: { type: Date, default: Date.now },
    availabilityFlag: { type: Boolean, default: true },
    health: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Bad', 'Critical'], default: 'Excellent' }
});

// Add geospatial index
CycleSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Cycle', CycleSchema);
