const express = require('express');
const { getDigitalClass } = require('../controllers/digital_class');

const router = express.Router();

router.route('/:id').get(getDigitalClass);
module.exports = router;
