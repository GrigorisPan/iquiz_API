const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Quiz = require('../models/Quiz');
const Users = require('../models/User');

//  @desc     Get all quizzes
//  @route    GET /api/v1/quizzes
//  @access   Private
exports.getQuizzes = asyncHandler(async (req, res, next) => {
  const quizzes = await Quiz.findAll();
  res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
});

//  @desc     Get single quiz
//  @route    GET /api/v1/quizzes/:id
//  @access   Private
exports.getQuiz = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const quiz = await Quiz.findOne({ where: { id } });

  if (!quiz) {
    return next(
      new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: quiz });
});

//  @desc     Create new quiz
//  @route    POST /api/v1/quizzes
//  @access   Private
exports.createQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.create(req.body);
  console.log(quiz);
  res.status(201).json({
    success: true,
    data: quiz,
  });
});

//  @desc     Update quiz
//  @route    POST /api/v1/quizzes/:id
//  @access   Private
exports.updateQuiz = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const { title, description, time, questions_otp, photo, status } = req.body;

  const quiz = await Quiz.findOne({ where: { id } });

  if (!quiz) {
    return next(
      new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
    );
  }

  quiz.title = title;
  quiz.description = description;
  quiz.time = time;
  quiz.questions_otp = questions_otp;
  quiz.photo = photo;
  quiz.status = status;

  await quiz.save();

  res.status(201).json({
    success: true,
    data: quiz,
  });
});

//  @desc     Delete quiz
//  @route    DELETE /api/v1/quizzes/:id
//  @access   Private
exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;

  const quiz = await Quiz.findOne({
    where: { id },
  });
  if (!quiz) {
    return next(
      new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
    );
  }
  await quiz.destroy();

  res.status(200).json({ message: 'Quiz deleted!' });
});
