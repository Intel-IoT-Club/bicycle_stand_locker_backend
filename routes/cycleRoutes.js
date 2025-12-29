const express = require('express');
const router = express.Router();
const { getAllCycles,deleteAllCycles,getNearestCycles,getBikeRoute,updateCycle,updateCycleLocation,getCycleLocation } = require('../controllers/cycle');

router.get('/all', getAllCycles);
router.post('/search', getNearestCycles);
router.delete('/delete-all', deleteAllCycles);
router.post('/ride-route', getBikeRoute);
router.get('/:id/location', getCycleLocation);
router.post('/:id/location',updateCycleLocation);
router.patch('/:id',updateCycle );


module.exports = router;
