const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Quiz = require('../models/Quiz');
const Users = require('../models/User');
const Reports = require('../models/Report');

//  @desc     Get all reports
//  @route    GET /api/v1/reports/all
//  @access   Private (Admin)
exports.getAllReports = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;
  if (type === 1) {
    const reports = await Reports.findAll({
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

    if (!reports) {
      return next(
        new ErrorResponse(`Η αναφορά δεν βρέθηκε με id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } else {
    return next(
      new ErrorResponse(`Ο χρήστης δεν έχει δικαίωμα να λάβει αναφορές`, 401)
    );
  }
});

//  @desc     Get reports by specific quiz id
//  @route    GET /api/v1/reports/:id
//  @access   Private (Teacher + Admin)
exports.getReports = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const type = +req.user.type;
  if (type === 2 || type === 1) {
    const reports = await Reports.findAll({
      where: { quiz_id: id },
    });

    if (!reports) {
      return next(
        new ErrorResponse(`Η αναφορά δεν βρέθηκε με id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: reports,
    });
  } else {
    return next(
      new ErrorResponse(`Ο χρήστης δεν έχει δικαίωμα να λάβει αναφορές`, 401)
    );
  }
});

//  @desc     Create report
//  @route    POST /api/v1/reports
//  @access   Private (Teacher & Student)
exports.createReport = asyncHandler(async (req, res, next) => {
  req.body.user_id = req.user.id;
  const type = +req.user.type;
  if (type === 0) {
    const quiz = await Quiz.findOne({ where: { id: req.body.quiz_id } });
    if (!quiz) {
      return next(
        new ErrorResponse(
          `Δεν υπάρχεί το κουίζ με id ${req.body.quiz_id}.`,
          401
        )
      );
    }

    const reports = await Reports.findAll({
      where: { user_id: req.body.user_id, quiz_id: req.body.quiz_id },
    });
    if (reports.length >= 5) {
      return next(
        new ErrorResponse(`Δεν έχεις δικαίωμα να κάνεις αναφορά.`, 401)
      );
    }
    const report = await Reports.create(req.body);
    //console.log(report);

    res.status(201).json({
      success: true,
      data: 'Επιτυχής αναφορά!',
    });
  } else {
    return next(
      new ErrorResponse(`Ο χρήστης δεν έχει δικαίωμα δημιουργίας αναφοράς`, 401)
    );
  }
});

//  @desc     Delete report
//  @route    DELETE /api/v1/reports/:id
//  @access   Private (Teacher + Admin)
exports.deleteReport = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;
  const userId = +req.user.id;
  const report_id = +req.params.id;

  if (type === 1 || type === 2) {
    const report = await Reports.findOne({
      where: { id: report_id },
    });
    if (!report) {
      return next(new ErrorResponse(`Η αναφορά δεν βρέθηκε`, 404));
    }
    if (type === 2) {
      const quiz = await Quiz.findOne({
        where: { id: report.quiz_id },
      });
      if (!quiz) {
        return next(new ErrorResponse(`Η αναφορά δεν βρέθηκε`, 404));
      }

      if (quiz.user_id !== userId) {
        return next(
          new ErrorResponse(
            `Ο χρήστης δεν έχει δικαίωμα να διαγράψει αναφορά`,
            401
          )
        );
      }
    }
    await report.destroy();

    res.status(200).json({ message: 'Επιτυχής διαγραφή!' });
  } else {
    return next(
      new ErrorResponse(`Ο χρήστης δεν έχει δικαίωμα να διαγράψει αναφορά`, 401)
    );
  }
});

//  @desc     Check if user can report  quiz
//  @route    GET /api/v1/reports/check/:id
//  @access   Private  (Teacher + Student)
exports.checkReport = asyncHandler(async (req, res, next) => {
  const quiz_id = +req.params.id;
  const user_id = +req.user.id;
  const type = +req.user.type;

  if (type === 0) {
    const quiz = await Quiz.findOne({ where: { id: quiz_id } });

    if (!quiz) {
      return next(
        new ErrorResponse(`Δεν υπάρχεί το κουίζ με id ${quiz_id}.`, 401)
      );
    }

    const reports = await Reports.findAll({
      where: { user_id, quiz_id },
    });
    if (reports.length >= 5) {
      res.status(200).json({ success: true, data: false });
    }
    res.status(200).json({ success: true, data: true });
  }
});
