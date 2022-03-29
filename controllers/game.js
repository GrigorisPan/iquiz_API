const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Statistic = require('../models/Statistic');
const Quiz = require('../models/Quiz');
const axios = require('axios');
const xml2js = require('xml2js');

//  @desc     Check if user can play the quiz
//  @route    GET /api/v1/game/:id
//  @access   Private  (Student + Teacher)

exports.checkPlay = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const user_id = +req.user.id;
  const type = +req.user.type;
  //Student
  if (type === 0) {
    let play_count;

    const quiz = await Quiz.findOne({
      where: { id, status: 'public' },
    });
    if (!quiz) {
      res.status(200).json({ data: false });
    }
    const repeat = +quiz.repeat;
    //console.log(repeat);
    const statistic = await Statistic.findOne({
      where: { user_id: user_id, quiz_id: id },
    });
    if (!statistic) {
      play_count = 0;
    } else {
      play_count = +statistic.play_count;
    }
    //console.log(play_count < repeat);
    if (repeat === 0 || play_count < repeat) {
      res.status(200).json({ data: true });
    } else {
      res.status(200).json({ data: false });
    }
  }
  //Teacher
  else if (type === 2) {
    const quiz = await Quiz.findOne({
      where: { id, status: 'public' },
    });
    if (!quiz) {
      res.status(200).json({ data: false });
    }
    res.status(200).json({ data: true });
  } else {
    return next(
      new ErrorResponse(
        `Ο χρήστης δεν έχει δικαίωμα να ξεκινήσει παιχνίδι`,
        401
      )
    );
  }
});

//  @desc     Get Questions from arch database
//  @route    GET /api/v1/game/play/:id
//  @access   Private  (Student & Teacher & Admin)

exports.getQuestions = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;

  const quiz = await Quiz.findOne({
    where: { id, status: 'public' },
  });
  if (!quiz) {
    return next(
      new ErrorResponse(`Δεν βρέθηκες το κουίζ με id  ${req.params.id}`, 404)
    );
  }
  const otp = quiz.questions_otp;
  //console.log(otp);

  const questions_arch = await axios.get(
    `http://arch.ece.uowm.gr/iexamsII/outputxml.php?otpid=${otp}`
  );

  if (questions_arch) {
    if (
      questions_arch.data === 'ERROR' ||
      questions_arch.data === 'Internal Server Error'
    ) {
      //console.log(res.data);
      return next(new ErrorResponse('Σφάλμα εύρεσης ερωτήσεων', 404));
    } else {
      const data = questions_arch.data;
      // convert XML to JSON
      xml2js.parseString(
        data,
        /* { sanitize: true, object: true, trim: true }, */
        (err, result) => {
          if (err) {
            return next(new ErrorResponse('Σφάλμα εύρεσης ερωτήσεων', 404));
          }
          // `result` is a JavaScript object
          // convert it to a JSON string
          /*  const json = JSON.stringify(result, null, 4); */

          // log JSON string
          //console.log(result);
          res.status(200).json({ success: true, data: result });
        }
      );
    }
  } else {
    return next(new ErrorResponse('Σφάλμα διακομιστή', 404));
  }
});

//  @desc     Save game statistics
//  @route    POST /api/v1/game/save
//  @access   Private (Student)
exports.saveGameStatistics = asyncHandler(async (req, res, next) => {
  req.body.user_id = req.user.id;
  const user_id = req.user.id;
  const type = +req.user.type;
  //Student
  if (type === 0) {
    const quiz_id = +req.body.quiz_id;

    if (!quiz_id) {
      return next(new ErrorResponse(`Λανθασμένα στοιχεία`, 400));
    }

    //Find if student has statistics
    const user_statistics = await Statistic.findOne({
      where: { user_id, quiz_id },
    });
    //console.log(user_statistics);

    if (!user_statistics) {
      saveGame = {
        user_id,
        quiz_id,
        score_avg: 0,
        correct_avg: 0,
        false_avg: 0,
        play_count: 1,
        save_flag: true,
      };

      const statistic = await Statistic.create(saveGame);
      //console.log(statistic);
      return res.status(200).json({
        success: true,
        message: 'Επιτυχής Αποθήκευση!',
      });
    }

    user_statistics.play_count = user_statistics.play_count + 1;
    user_statistics.save_flag = true;
    //console.log(user_statistics.play_count);
    await user_statistics.save();

    return res.status(200).json({
      success: true,
      message: 'Επιτυχής Αποθήκευση!',
    });
  } else if (type === 1 || type === 2) {
    return res.status(200).json({
      success: true,
      message: 'Καθηγητές και διαχειριστές δεν αποθηκεύουν σκορ.',
    });
  } else {
    return next(
      new ErrorResponse(
        `Ο χρήστης δεν έχει δικαίωμα να αποθηκεύσει στατιστικά παιχνιδιού`,
        401
      )
    );
  }
});

//  @desc     Update game statistics
//  @route    PUT /api/v1/game/save
//  @access   Private (Student)
exports.updateGameStatistics = asyncHandler(async (req, res, next) => {
  req.body.user_id = req.user.id;
  const user_id = req.user.id;
  const type = +req.user.type;
  //Student
  if (type === 0) {
    const quiz_id = +req.body.quiz_id;
    const score = +req.body.score;
    const true_ans = +req.body.true_ans;
    const false_ans = +req.body.false_ans;
    if (!quiz_id || !score || !true_ans || !false_ans) {
      return next(new ErrorResponse(`Λανθασμένα στοιχεία`, 400));
    }

    //Find if student has statistics
    const user_statistics = await Statistic.findOne({
      where: { user_id, quiz_id },
    });
    //console.log(user_statistics);
    if (!user_statistics) {
      return next(new ErrorResponse(`Δεν βρέθηκαν στατιστικά.`, 404));
    }
    if (user_statistics.save_flag) {
      if (user_statistics.play_count === 1) {
        user_statistics.user_id = user_id;
        user_statistics.quiz_id = quiz_id;
        user_statistics.score_avg = score;
        user_statistics.correct_avg = true_ans;
        user_statistics.false_avg = false_ans;
        //console.log(true_ans);
        await user_statistics.save();
        //console.log(statistic);
        return res.status(200).json({
          success: true,
          data: user_statistics,
        });
      }

      const asyncFunc = asyncHandler(async (user_statistics) => {
        //Calculate average score
        let score_avg = user_statistics.score_avg;
        let play_count = user_statistics.play_count;
        score_avg = score_avg * (play_count - 1);
        score_avg = (score_avg + score) / play_count;
        //console.log(score_avg);
        user_statistics.score_avg = Math.round(score_avg);

        //Calculate average correct answers
        let correct_avg = user_statistics.correct_avg;
        correct_avg = correct_avg * (play_count - 1);
        correct_avg = (correct_avg + true_ans) / play_count;
        //console.log(correct_avg);
        user_statistics.correct_avg = Math.round(correct_avg);

        //Calculate average false answers
        let false_avg = user_statistics.false_avg;
        false_avg = false_avg * (play_count - 1);
        false_avg = (false_avg + false_ans) / play_count;
        //console.log(false_avg);
        user_statistics.false_avg = Math.round(false_avg);

        user_statistics.save_flag = false;
      });
      await asyncFunc(user_statistics);
      //console.log(user_statistics.play_count);
      await user_statistics.save();

      return res.status(200).json({
        success: true,
        message: 'Επιτυχής Αποθήκευση!',
      });
    } else {
      return next(
        new ErrorResponse(`Πρέπει να ξεκινήσεις πρώτα ένα παιχνίδι.`, 400)
      );
    }
  } else if (type === 1 || type === 2) {
    return res.status(200).json({
      success: true,
      message: 'Καθηγητές και διαχειριστές δεν αποθηκεύουν σκορ.',
    });
  } else {
    return next(
      new ErrorResponse(
        `Ο χρήστης δεν έχει δικαίωμα να ενημερώσει στατιστικά παιχνιδιού`,
        401
      )
    );
  }
});
