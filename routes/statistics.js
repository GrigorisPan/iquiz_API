const express = require('express');
const {
  getStatistics,
  getStatisticsDashboard,
  getScore,
  deleteUserInClass,
  getUsersInClass,
  getStatisticsAll,
  getAllUsersInClass,
  deleteStatistics,
} = require('../controllers/statistics');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/').get(protect, getStatistics);
router.route('/all').get(protect, getStatisticsAll);
router.route('/dashboard').get(protect, getStatisticsDashboard);
router.route('/:id').delete(protect, deleteStatistics);
router.route('/score/:id').get(protect, getScore);
router.route('/users/all').get(protect, getAllUsersInClass);
router.route('/users/:id').get(protect, getUsersInClass);
router.route('/users/:id').delete(protect, deleteUserInClass);
module.exports = router;
