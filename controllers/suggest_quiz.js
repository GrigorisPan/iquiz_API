const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const SuggestQuiz = require('../models/SuggestQuiz');
const Quiz = require('../models/Quiz');

//  @desc     Get suggest quizzes by specific class id
//  @route    GET /api/v1/suggestquiz/:id
//  @access   Private
exports.getSuggestQuiz = asyncHandler(async (req, res, next) => {
  id = +req.params.id;
  const suggestquiz = await SuggestQuiz.findAll({
    where: { class_id: id },
    include: [{ model: Quiz }],
  });

  setTimeout(() => {
    res
      .status(200)
      .json({ success: true, count: suggestquiz.length, data: suggestquiz });
  }, 1000);
});
