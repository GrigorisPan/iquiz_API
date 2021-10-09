const express = require('express');
const { getReports } = require('../controllers/reports');

const router = express.Router();

router.route('/:id').get(getReports);
module.exports = router;
