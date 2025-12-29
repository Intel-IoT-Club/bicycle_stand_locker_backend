const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authenticate');
const { reportIssue, getBikeMaintenanceLogs, resolveIssue } = require('../controllers/maintenance');

router.use(auth);

router.post('/report', reportIssue);
router.get('/bike/:bikeId', getBikeMaintenanceLogs);
router.patch('/resolve/:logId', resolveIssue);

module.exports = router;
