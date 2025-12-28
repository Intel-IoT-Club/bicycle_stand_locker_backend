const MaintenanceLog = require('../models/MaintenanceLog');
const Cycle = require('../models/Cycle');

exports.reportIssue = async (req, res) => {
    try {
        const { bikeId, issue, severity, reportedBy = 'Owner' } = req.body;

        // Verify bike ownership if reported by owner
        if (reportedBy === 'Owner') {
            const bike = await Cycle.findOne({ _id: bikeId, ownerID: req.user.id });
            if (!bike) return res.status(404).json({ success: false, message: "Bike not found or ownership mismatch" });
        }

        const log = await MaintenanceLog.create({
            bikeId,
            ownerId: req.user.id, // Assuming the reporter or the bike owner
            reportedBy,
            issue,
            severity,
            status: 'Reported'
        });

        // Optionally update bike health based on severity
        if (severity === 'Critical') {
            await Cycle.findByIdAndUpdate(bikeId, { health: 'Critical', availabilityFlag: false });
        } else if (severity === 'High') {
            await Cycle.findByIdAndUpdate(bikeId, { health: 'Bad' });
        }

        res.status(201).json({ success: true, log });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getBikeMaintenanceLogs = async (req, res) => {
    try {
        const { bikeId } = req.params;
        const logs = await MaintenanceLog.find({ bikeId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, logs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.resolveIssue = async (req, res) => {
    try {
        const { logId } = req.params;
        const log = await MaintenanceLog.findByIdAndUpdate(logId, {
            status: 'Resolved',
            resolvedAt: new Date()
        }, { new: true });

        if (!log) return res.status(404).json({ success: false, message: "Log not found" });

        // Update bike health back to Excellent if no other open issues
        const openLogs = await MaintenanceLog.countDocuments({ bikeId: log.bikeId, status: { $ne: 'Resolved' } });
        if (openLogs === 0) {
            await Cycle.findByIdAndUpdate(log.bikeId, { health: 'Excellent' });
        }

        res.status(200).json({ success: true, log });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
