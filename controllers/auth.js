const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Users = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

//  @desc     Register user
//  @route    POST /api/v1/auth/register
//  @access   Public

exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password, type } = req.body;
  //console.log(req.body);
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

//  @desc     Get refresh token
//  @route    Get /api/v1/auth/refreshToken
//  @access   Private
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const refreshToken = req.token;

  const refreshHashToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  if (refreshHashToken !== user.refreshToken) {
    return next(new ErrorResponse('Invalid refresh token', 403));
  }

  sendTokenResponse(user, 200, res);
});

//  @desc     Get user info
//  @route    Get /api/v1/auth/check
//  @access   Private
exports.authCheck = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;
  const id = +req.user.id;

  res.json({
    id,
    type,
  });
});

// @desc    Logout controller to clear cookie and token
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  const user = req.user;

  user.refreshToken = '';
  await user.save();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 1000 * 60 * 60
    ),
    httpOnly: true,
  };

  //Https only in production mode
  /*   if(process.env.NODE_ENV === 'production'){
    options.secure = true;
  } */

  // Set token to none and expire after 5 seconds
  res
    .status(200)
    .cookie('refreshToken', 'none', options)
    .json({ success: true, message: 'User logged out successfully' });
});

//Get token from model, create cookie and send response
const sendTokenResponse = asyncHandler(async (user, statusCode, res) => {
  //Create Token
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshJwtToken();
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const expiration = new Date((decoded.exp - 600) * 1000);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 1000 * 60 * 60
    ),
    httpOnly: true,
  };

  //Https only in production mode
  /*   if(process.env.NODE_ENV === 'production'){
    options.secure = true;
  } */

  //Set refresh token in refreshTokens DB
  await user.save();

  res.status(statusCode).cookie('refreshToken', refreshToken, options).json({
    success: true,
    id: user.id,
    type: user.type,
    username: user.username,
    email: user.email,
    token,
    expiration,
  });
});
