const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Quiz = require('../models/Quiz');
const Users = require('../models/User');
const Statistic = require('../models/Statistic');
const Report = require('../models/Report');
//  @desc     Get quiz statistics
//  @route    GET /api/v1/statistics
//  @access   Private
/* exports.getQuizStatistics = asyncHandler(async (req, res, next) => {
  const quiz_id = 1;
  const data = await Statistic.findAll({
    where: { quiz_id },
  });
  const quiz = await Quiz.findOne({
    where: { id: quiz_id },
  });
  let count_users = 0;
  let score_avg = 0;
  let correct_avg = 0;
  let false_avg = 0;
  data.forEach(
    (item) => (
      (count_users += 1),
      (score_avg = item.score_avg + score_avg),
      (correct_avg = item.correct_avg + correct_avg),
      (false_avg = item.false_avg + false_avg)
    )
  );
  score_avg = score_avg / data.length;
  correct_avg = correct_avg / data.length;
  false_avg = false_avg / data.length;
  statistics = {
    ...quiz.dataValues,
    count_users,
    score_avg,
    correct_avg,
    false_avg,
  };

  res.status(200).json({
    success: true,
    statistics,
  });
});
 */
//  @desc     Get quizzes statistics by specific user id (teacher)
//  @route    GET /api/v1/statistics/:id
//  @access   Private
exports.getTeacherStatistics = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const statistics = [];

  const user_quizzes = await Quiz.findAll({
    where: { user_id: id },
  });
  if (user_quizzes.length === 0 || !user_quizzes) {
    return next(
      new ErrorResponse(
        `Statistics not found with user id of ${req.params.id}`,
        404
      )
    );
  }

  const quizzes_id = user_quizzes.map((quiz) => quiz.id);

  const asyncFunc = asyncHandler(async (quiz_id) => {
    const data = await Statistic.findAll({
      where: { quiz_id },
    });

    if (data.length === 0) {
      return [];
    }

    const reports = await Report.findAll({
      where: { quiz_id: quiz_id },
    });

    const quiz = await Quiz.findOne({
      where: { id: quiz_id },
    });
    let count_play_users = 0;
    let score_avg = 0;
    let correct_avg = 0;
    let false_avg = 0;
    data.forEach(
      (item) => (
        (count_play_users += 1),
        (score_avg = item.score_avg + score_avg),
        (correct_avg = item.correct_avg + correct_avg),
        (false_avg = item.false_avg + false_avg)
      )
    );
    score_avg = score_avg / data.length;
    correct_avg = correct_avg / data.length;
    false_avg = false_avg / data.length;
    return (statistic = {
      id: quiz.dataValues.id,
      title: quiz.dataValues.title,
      count_play_users,
      score_avg,
      correct_avg,
      false_avg,
      reports,
    });
  });

  for (let i in quizzes_id) {
    let quiz_id = quizzes_id[i];
    result = await asyncFunc(quiz_id);
    if (result.length === 0 || !result) break;
    statistics.push(result);
  }

  res.status(200).json({
    success: true,
    data: statistics,
  });
});
