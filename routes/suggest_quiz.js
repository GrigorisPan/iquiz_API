const express = require('express');
const {
  getSuggestQuizAll,
  addSuggestQuiz,
  getSuggestQuiz,
  getAvalDigitalClassesSuggest,
  deleteSuggestQuiz,
} = require('../controllers/suggest_quiz');

const { protect } = require('../middleware/auth');

const router = express.Router();
router.route('/all').get(protect, getSuggestQuizAll);
router.route('/add').put(protect, addSuggestQuiz);
router.route('/available/:id').get(protect, getAvalDigitalClassesSuggest);
router.route('/:id').get(getSuggestQuiz).delete(protect, deleteSuggestQuiz);
module.exports = router;
