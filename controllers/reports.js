const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Quiz = require('../models/Quiz');
const Users = require('../models/User');
const Reports = require('../models/Report');

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
