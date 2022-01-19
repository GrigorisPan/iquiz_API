const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Quiz = require('../models/Quiz');
const Users = require('../models/User');
const Reports = require('../models/Report');

//  @desc     Get all reports
//  @route    GET /api/v1/reports/all
//  @access   Private (Teacher + Admin)
exports.getAllReports = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;
  if (type === 1) {
    const reports = await Reports.findAll({});

    if (!reports) {
      return next(
        new ErrorResponse(
          `Reports not found with quiz id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to get reports`, 401)
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
        new ErrorResponse(
          `Reports not found with quiz id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: reports,
    });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to get reports`, 401)
    );
  }
});

//  @desc     Delete report
//  @route    DELETE /api/v1/reports/:id
//  @access   Private (Teacher + Admin)
exports.deleteReport = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;

  if (type === 1) {
    const ids = req.params.id.split('-');
    const user_id = +ids[0];
    const quiz_id = +ids[1];

    const report = await Reports.findOne({
      where: { user_id, quiz_id },
    });
    if (!report) {
      return next(new ErrorResponse(`Report not found`, 404));
    }
    await report.destroy();

    res.status(200).json({ message: 'Report deleted!' });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to delete a report`, 401)
    );
  }
});
