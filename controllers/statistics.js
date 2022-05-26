const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Quiz = require('../models/Quiz');
const Users = require('../models/User');
const Statistic = require('../models/Statistic');
/* const UsersInclass = require('../models/UsersInclass'); */
const Report = require('../models/Report');
const SuggestQuiz = require('../models/SuggestQuiz');
const InClass = require('../models/InClass');
const DigitalClass = require('../models/DigitalClass');
const Reports = require('../models/Report');

//  @desc     Get all statistics
//  @route    GET /api/v1/statistics/all
//  @access   Private (Admin)
exports.getStatisticsAll = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;
  if (type === 1) {
    const statistics = await Statistic.findAll({
      include: [
        {
          model: Users,
          attributes: ['username'],
        },
        {
          model: Quiz,
          attributes: ['title'],
        },
      ],
    });

    /*  if (!statistics) {
      return next(new ErrorResponse(`Δεν βρέθηκαν στατιστικά`, 404));
    } */
    res.status(200).json({
      success: true,
      data: statistics,
    });
  } else {
    return next(
      new ErrorResponse(`Ο χρήστης δεν έχει δικαίωμα να λάβει στατιστικά`, 401)
    );
  }
});

//  @desc     Get dashboard statistics
//  @route    GET /api/v1/statistics/dashboard
//  @access   Private (Admin)
exports.getStatisticsDashboard = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;
  if (type === 1) {
    const users = await Users.findAll({});
    const quizzes = await Quiz.findAll({});
    const suggestquizzes = await SuggestQuiz.findAll({});
    const statistics = await Statistic.findAll({});
    const dClasses = await DigitalClass.findAll({});
    const reports = await Reports.findAll({});

    const statisticsDash = {
      users_count: users.length,
      quizzes_count: quizzes.length,
      suggestquizzes_count: suggestquizzes.length,
      statistics_count: statistics.length,
      dClasses_count: dClasses.length,
      reports_count: reports.length,
    };
    res.status(200).json({
      success: true,
      data: statisticsDash,
    });
  } else {
    return next(
      new ErrorResponse(`Ο χρήστης δεν έχει δικαίωμα να λάβει στατιστικά`, 401)
    );
  }
});

//  @desc     Delete  statistics
//  @route    Delete /api/v1/statistics/:id
//  @access   Private (Admin)
exports.deleteStatistics = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;
  if (type === 1) {
    const ids = req.params.id.split('-');
    const user_id = +ids[0];
    const quiz_id = +ids[1];

    const statistics = await Statistic.findOne({
      where: { user_id, quiz_id },
    });
    if (!statistics) {
      return next(new ErrorResponse(`Δεν βρέθηκαν στατιστικά`, 404));
    }
    await statistics.destroy();

    res.status(200).json({ message: 'Επιτυχής διαγραφή!' });
  } else {
    return next(
      new ErrorResponse(
        `Ο χρήστης δεν έχει δικαίωμα να διαγράψει στατιστικά`,
        401
      )
    );
  }
});

//  @desc     Get quizzes statistics by specific user id
//  @route    GET /api/v1/statistics/
//  @access   Private (Teacher + Admin)
exports.getStatistics = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;
  let id = +req.params.id;
  const statistics = [];

  // Teacher & Admin Statitics
  if (type === 2 || type === 1) {
    if (type === 2) {
      id = +req.user.id;
    }

    const user_quizzes = await Quiz.findAll({
      where: { user_id: id },
    });
    //console.log(user_quizzes);
    if (user_quizzes.length === 0 || !user_quizzes) {
      return next(new ErrorResponse(`Δεν βρέθηκαν στατιστικά`, 404));
    }

    const quizzes_id = user_quizzes.map((quiz) => quiz.id);
    //console.log(quizzes_id);
    const asyncFunc = asyncHandler(async (quiz_id) => {
      //console.log(quiz_id);
      const data = await Statistic.findAll({
        where: { quiz_id },
      });

      //console.log(data);
      if (data.length === 0) {
        return [];
      }

      const reports = await Reports.findAll({
        where: { quiz_id },
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
      const result = await asyncFunc(quiz_id);
      if (result.length === 0 || !result) continue;
      statistics.push(result);
    }

    res.status(200).json({
      success: true,
      data: statistics,
    });
  }
  // Student Statitics
  else if (type === 0) {
    const user_id = +req.user.id;
    const statistics = [];

    //Find if student has statistics
    const user_statistics = await Statistic.findAll({ where: { user_id } });
    if (user_statistics.length === 0 || !user_statistics) {
      return res.status(200).json({
        success: true,
        data: statistics,
      });
    }

    //Find all quizzes
    const quizzes = await Quiz.findAll();

    if (quizzes.length === 0 || !quizzes) {
      return next(new ErrorResponse(`Σφάλμα `, 404));
    }

    // Collection of necessary statistical and quiz data
    for (i = 0; i < user_statistics.length; i++) {
      for (j = 0; j < quizzes.length; j++) {
        if (quizzes[j].id === user_statistics[i].quiz_id) {
          const data = {
            id: quizzes[j].id,
            title: quizzes[j].title,
            play_count: user_statistics[i].play_count,
            score_avg: user_statistics[i].score_avg,
            correct_avg: user_statistics[i].correct_avg,
            false_avg: user_statistics[i].false_avg,
          };
          //console.log(data);
          statistics[i] = data;
          //console.log(statistics);
          break;
        }
      }
    }
    // console.log(statistics);

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } else {
    return next(
      new ErrorResponse(`Ο χρήστης δεν έχει δικαίωμα να λάβει στατιστικά`, 401)
    );
  }
});

//  @desc     Get scores by specific class id
//  @route    GET /api/v1/statistics/score/:id
//  @access   Private (Teacher + Admin + Student)
exports.getScore = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  let score = [];

  const users_inclass = await InClass.findAll({
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

//  @desc     Get users in class by specific class id
//  @route    GET /api/v1/statistics/users/:id
//  @access   Private (Teacher + Admin + Student)
exports.getUsersInClass = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;

  const users_inclass = await InClass.findAll({
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

//  @desc     Get all users registered in classes
//  @route    GET /api/v1/statistics/users/all
//  @access   Private (Admin)
exports.getAllUsersInClass = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;

  if (type === 1) {
    const users_inclass = await InClass.findAll({
      include: [
        {
          model: Users,
          attributes: ['username'],
        },
        {
          model: DigitalClass,
          attributes: ['title'],
        },
      ],
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
  } else {
    return next(
      new ErrorResponse(`Ο χρήστης δεν έχει δικαίωμα να λάβει χρήστες`, 401)
    );
  }
});

//  @desc     Delete user in class
//  @route    DELETE /api/v1/statistics/users/:id
//  @access   Private (Admin)
exports.deleteUserInClass = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;

  if (type === 1) {
    const ids = req.params.id.split('-');
    const user_id = +ids[0];
    const class_id = +ids[1];

    const users_inclass = await InClass.findOne({
      where: { user_id, class_id },
    });
    if (!users_inclass) {
      return next(new ErrorResponse(`Δεν βρέθηκε ο χρήστης`, 404));
    }
    await users_inclass.destroy();

    res.status(200).json({ message: 'Επιτυχής διαγραφή!' });
  } else {
    return next(
      new ErrorResponse(
        `Ο χρήστης δεν έχει δικαίωμα να διαγράψει χρήστη από ψηφιακή τάξη`,
        401
      )
    );
  }
});
