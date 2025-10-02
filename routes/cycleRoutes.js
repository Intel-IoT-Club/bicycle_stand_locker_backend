const express = require('express');
const router = express.Router();
const { bulkAddCycles,getAllCycles,deleteAllCycles } = require('../controllers/cycle');

router.post('/bulk-add', bulkAddCycles);
router.get('/all', getAllCycles);
router.delete('/delete-all', deleteAllCycles);
module.exports = router;
