const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Quiz = require('../models/Quiz');
const Users = require('../models/User');
const Statistic = require('../models/Statistic');
const UsersInclass = require('../models/UsersInclass');
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
//  @desc     Get quizzes statistics by specific user id (Teacher)
//  @route    GET /api/v1/statistics/:id
//  @access   Private (Teacher + Admin)
exports.getTeacherStatistics = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;
  let id = +req.params.id;
  const statistics = [];

  if (type === 2 || type === 1) {
    if (type === 2) {
      id = +req.user.id;
    }
    const user_quizzes = await Quiz.findAll({
      where: { user_id: id },
    });
    if (user_quizzes.length === 0 || !user_quizzes) {
      return next(new ErrorResponse(`Statistics not found `, 404));
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
  } else {
    return next(
      new ErrorResponse(`User is not authorized to get statistics`, 401)
    );
  }
});

//  @desc     Get scores by specific class id
//  @route    GET /api/v1/statistics/score/:id
//  @access   Private (Teacher + Admin + Student)
exports.getScore = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  let score = [];

  const users_inclass = await UsersInclass.findAll({
    where: { class_id: id },
  });
  //console.log(users_inclass);
  if (users_inclass.length === 0 || !users_inclass) {
    return res.status(200).json({
      success: true,
      data: score,
    });
  }
  //console.log(users_inclass.user_id);
  const users_id = users_inclass.map((user) => user.user_id);
  //console.log(users_id);

  const data = await Statistic.findAll({
    where: { user_id: users_id },
    include: { model: Users },
  });
  if (data.length === 0 || !users_inclass) {
    return res.status(200).json({
      success: true,
      data: score,
    });
  }

  //console.log(data);
  let sum = 0;
  let count = 0;
  let name = '';
  let play_count = 0;
  let q = 0;
  for (let i = 1; i <= users_id.length; i++) {
    sum = 0;
    count = 0;
    play_count = 0;
    for (let j = 1; j <= data.length; j++) {
      if (users_id[i - 1] === data[j - 1].user_id) {
        //console.log(users_id[i - 1], data[j - 1].user_id);
        sum = sum + data[j - 1].score_avg;
        count += 1;
        username = data[j - 1].users_p.username;
        play_count += data[j - 1].play_count;
      }
    }
    if (count > 0) {
      //console.log(i);
      score[q] = {
        username: username,
        score: sum / count,
        play_count: play_count,
      };
      q++;
    }
  }
  score.sort(function (a, b) {
    return b.score - a.score;
  });
  //console.log(score);

  res.status(200).json({
    success: true,
    data: score,
  });
});

//  @desc     Get users by specific class id
//  @route    GET /api/v1/statistics/users/:id
//  @access   Private (Teacher + Admin + Student)
exports.getUsersInClass = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;

  const users_inclass = await UsersInclass.findAll({
    where: { class_id: id },
  });

  if (users_inclass.length === 0 || !users_inclass) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: users_inclass,
    });
  }

  res.status(200).json({
    success: true,
    count: users_inclass.length,
    data: users_inclass,
  });
});
