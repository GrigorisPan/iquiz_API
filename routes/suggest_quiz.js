const express = require('express');
const {
  addSuggestQuiz,
  getSuggestQuiz,
  getAvalDigitalClassesSuggest,
} = require('../controllers/suggest_quiz');

const { protect } = require('../middleware/auth');

const router = express.Router();
router.route('/add').put(protect, addSuggestQuiz);
router.route('/available/:id').get(protect, getAvalDigitalClassesSuggest);
router.route('/:id').get(getSuggestQuiz);
module.exports = router;
