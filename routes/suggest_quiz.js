const express = require('express');
const { getSuggestQuiz } = require('../controllers/suggest_quiz');

const router = express.Router();

router.route('/:id').get(getSuggestQuiz);
module.exports = router;
