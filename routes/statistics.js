const express = require('express');
const { getTeacherStatistics } = require('../controllers/statistics');

const router = express.Router();

router.route('/:id').get(getTeacherStatistics);
module.exports = router;
