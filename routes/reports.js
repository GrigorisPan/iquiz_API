const express = require('express');
const {
  createReport,
  getReports,
  getAllReports,
  checkReport,
  deleteReport,
} = require('../controllers/reports');

const { protect } = require('../middleware/auth');

const router = express.Router();
router.route('/').post(protect, createReport);
router.route('/all').get(protect, getAllReports);
router.route('/check/:id').get(protect, checkReport);
router.route('/:id').get(protect, getReports).delete(protect, deleteReport);

module.exports = router;
