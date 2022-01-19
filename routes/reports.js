const express = require('express');
const {
  getReports,
  getAllReports,
  deleteReport,
} = require('../controllers/reports');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/all').get(protect, getAllReports);
router.route('/:id').get(protect, getReports).delete(protect, deleteReport);

module.exports = router;
