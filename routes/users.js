const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/').get(getUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(protect, deleteUser);

module.exports = router;
