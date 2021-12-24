const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const DigitalClass = require('../models/DigitalClass');

//  @desc     Get digital classes by specific user id
//  @route    GET /api/v1/digitalclass/user/
//  @access   Private
exports.getDigitalClassList = asyncHandler(async (req, res, next) => {
  id = req.user.id;
  const digitalClass = await DigitalClass.findAll({ where: { user_id: id } });

  res
    .status(200)
    .json({ success: true, count: digitalClass.length, data: digitalClass });
});

//  @desc     Get digital class by specific class id
//  @route    GET /api/v1/digitalclass/:id
//  @access   Private
exports.getDigitalClass = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const digitalClass = await DigitalClass.findAll({ where: { id } });

  if (digitalClass.length === 0 || !digitalClass) {
    return next(
      new ErrorResponse(
        `Digital Class not found with id of ${req.params.id}`,
        404
      )
    );
  }

  if (digitalClass[0].dataValues.user_id !== req.user.id) {
    return next(new ErrorResponse('Not authorize to access this route', 401));
  }
  res.status(200).json({ success: true, data: digitalClass });
});

//  @desc     Create digital classes
//  @route    PUT /api/v1/digitalclass/create/
//  @access   Private (Teacher + Admin)
exports.createDigitalClass = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;

  if (type === 2) {
    req.body.user_id = req.user.id;
    const digitalClass = await DigitalClass.create(req.body);
    res.status(201).json({ success: true, data: digitalClass });
  } else if (type === 1) {
    const digitalClass = await DigitalClass.create(req.body);
    res.status(201).json({ success: true, data: digitalClass });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to create digital class`, 401)
    );
  }
});
