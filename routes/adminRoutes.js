const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authenticate');
const { runMonthlyPayouts } = require('../jobs/payoutScheduler');

// Middleware to ensure admin/owner access (or just secure it with a secret key in headers)
// For now, I'll reuse the auth middleware but in production this should be strictly 'admin' role.

router.post('/trigger-payouts', auth, async (req, res) => {
    try {
        // Optional: Check if user is admin/owner
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        console.log(`Manual Payout Triggered by ${req.user.userName}`);

        // Run the job asynchronously (don't wait for it to finish to respond)
        runMonthlyPayouts();

        res.status(200).json({ success: true, message: "Payout job triggered in background." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
