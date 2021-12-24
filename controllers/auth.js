const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Users = require('../models/User');

//  @desc     Register user
//  @route    POST /api/v1/auth/register
//  @access   Public

exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password, type } = req.body;
  console.log(req.body);
  //Create user
  const user = await Users.create({ username, email, password, type });

  sendTokenResponse(user, 200, res);
});

//  @desc     Login user
//  @route    Get /api/v1/auth/Login
//  @access   Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email & password
  if (!email || !password) {
    return next(
      new ErrorResponse(
        'Παρακαλώ δώστε ένα email και έναν κωδικό πρόσβασης.',
        400
      )
    );
  }

  //Check for user
  const user = await Users.findOne({
    where: { email },
    attributes: {
      include: ['password'],
    },
  });

  if (!user) {
    return next(new ErrorResponse('Μη έγκυρα διαπιστευτήρια.', 401));
  }

  //Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Μη έγκυρα διαπιστευτήρια.', 401));
  }

  sendTokenResponse(user, 200, res);
});

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create Token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 1000 * 60 * 60 * 24
    ),
    httpOnly: true,
  };

  //Https only in production mode
  /*   if(process.env.NODE_ENV === 'production'){
    options.secure = true;
  } */

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    id: user.id,
    username: user.username,
    email: user.email,
    token,
  });
};
