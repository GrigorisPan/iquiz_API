const express = require('express');
const {
  getQuizzes,
  getQuiz,
  getAllQuizzes,
  getAllQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  quizPhotoUpload,
} = require('../controllers/quizzes');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/').get(protect, getQuizzes).post(protect, createQuiz);
router.route('/all').get(protect, getAllQuizzes);
router.route('/all/:id').get(protect, getAllQuiz);
router.route('/:id/photo').put(protect, quizPhotoUpload);

router
  .route('/:id')
  .get(protect, getQuiz)
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

module.exports = router;
