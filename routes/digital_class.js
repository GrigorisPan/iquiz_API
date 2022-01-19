const express = require('express');
const {
  getDigitalClassListAll,
  getDigitalClassList,
  getDigitalClass,
  createDigitalClass,
  enrollDigitalClass,
  deleteDigitalClass,
  updateDigitalClass,
} = require('../controllers/digital_class');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/').get(protect, getDigitalClassListAll);
router.route('/user').get(protect, getDigitalClassList);
router
  .route('/:id')
  .get(protect, getDigitalClass)
  .put(protect, updateDigitalClass)
  .delete(protect, deleteDigitalClass);
router.route('/create').post(protect, createDigitalClass);
router.route('/enroll').post(protect, enrollDigitalClass);

module.exports = router;
