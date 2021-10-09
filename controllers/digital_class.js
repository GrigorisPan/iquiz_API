const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const DigitalClass = require('../models/DigitalClass');

//  @desc     Get digital classes by specific user id
//  @route    GET /api/v1/digitalclass/:id
//  @access   Private
exports.getDigitalClass = asyncHandler(async (req, res, next) => {
  id = +req.params.id;
  const digitalClass = await DigitalClass.findAll({ where: { user_id: id } });

  setTimeout(() => {
    res
      .status(200)
      .json({ success: true, count: digitalClass.length, data: digitalClass });
  }, 1000);
});
