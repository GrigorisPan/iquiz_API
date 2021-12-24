const express = require('express');
const {
  getDigitalClassList,
  getDigitalClass,
  createDigitalClass,
} = require('../controllers/digital_class');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/user').get(protect, getDigitalClassList);
router.route('/:id').get(protect, getDigitalClass);
router.route('/create').put(protect, createDigitalClass);

module.exports = router;
