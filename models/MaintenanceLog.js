const mongoose = require('mongoose');

const MaintenanceLogSchema = new mongoose.Schema({
    bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cycle', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedBy: { type: String, enum: ['Owner', 'Rider'], required: true },
    issue: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
    status: { type: String, enum: ['Reported', 'In Progress', 'Resolved'], default: 'Reported' },
    costEstimate: { type: Number, default: 0 },
    resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceLog', MaintenanceLogSchema);
