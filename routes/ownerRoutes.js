const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authenticate');
const {
    getOwnerBikes,
    getOwnerLiveRides,
    getOwnerDashboardStats,
    toggleBikeAvailability,
    getOwnerUsers,
    registerCycle
} = require('../controllers/owner');

// All owner routes require authentication
router.use(auth);

// Check if user is an owner middleware (Optional but good for security)
const isOwner = (req, res, next) => {
    if (req.user.role !== 'owner') {
        return res.status(403).json({ success: false, message: "Access denied. Owners only." });
    }
    next();
};

router.get('/bikes', isOwner, getOwnerBikes);
router.get('/live-rides', isOwner, getOwnerLiveRides);
router.get('/stats', isOwner, getOwnerDashboardStats);
router.get('/users', isOwner, getOwnerUsers);
router.post('/register-unit', isOwner, registerCycle);
router.patch('/bike/:bikeId/toggle', isOwner, toggleBikeAvailability);

module.exports = router;
