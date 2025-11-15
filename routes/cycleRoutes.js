const express = require('express');
const router = express.Router();
const { bulkAddCycles,getAllCycles,deleteAllCycles,getNearestCycles,getBikeRoute,updateCycle } = require('../controllers/cycle');

router.post('/bulk-add', bulkAddCycles);
router.get('/all', getAllCycles);
router.post('/search', getNearestCycles);
router.delete('/delete-all', deleteAllCycles);
router.post('/ride-route', getBikeRoute);

router.patch('/:id',updateCycle );

module.exports = router;
