const express = require('express');
const {
  getTeacherStatistics,
  getScore,
  getUsersInClass,
} = require('../controllers/statistics');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/:id').get(protect, getTeacherStatistics);
router.route('/score/:id').get(protect, getScore);
router.route('/users/:id').get(protect, getUsersInClass);
module.exports = router;
