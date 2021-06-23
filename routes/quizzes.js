const express = require('express');
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require('../controllers/quizzes');

const router = express.Router();

router.route('/').get(getQuizzes).post(createQuiz);

router.route('/:id').get(getQuiz).put(updateQuiz).delete(deleteQuiz);

module.exports = router;
