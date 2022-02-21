const express = require('express');
const {
  register,
  login,
  authCheck,
  refreshToken,
  logout,
} = require('../controllers/auth');
const { protect, renew } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/check', protect, authCheck);
router.get('/logout', protect, logout);
router.get('/refreshToken', renew, refreshToken);

module.exports = router;
