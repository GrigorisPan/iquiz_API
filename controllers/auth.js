const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Users = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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
    return next(new ErrorResponse('Μη έγκυρο refresh token', 403));
  }

  sendTokenResponse(user, 200, res);
});

//  @desc     Get user info
//  @route    Get /api/v1/auth/check
//  @access   Private
exports.authCheck = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;
  const id = +req.user.id;

  res.status(200).json({
    id,
    type,
  });
});

// @desc    Logout
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  const user = req.user;

  user.refreshToken = null;

  await user.save();

  const options = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };

  //Https only in production mode
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Set token to none and expire after 5 seconds
  res
    .status(200)
    .cookie('refreshToken', 'none', options)
    .json({ success: true, message: 'Αποσύνδεση χρήστη' });
});

// @desc    Forgot password
// @route   GET /api/v1/auth/forgotpassword
// @access  Public
exports.forgotpassword = asyncHandler(async (req, res, next) => {
  const email = req.body.email;

  const user = await Users.findOne({ where: { email } });

  if (!user) {
    return next(new ErrorResponse('Δεν υπάρχει χρήστης με αυτό το email', 404));
  }

  //Get reset token
  const resetToken = user.getResetToken();
  await user.save();

  //Create reset url
  const resetUrl = `${req.protocol}://${process.env.FRONT_DOMAIN}/reset/${resetToken}`;
  const message = `Σας ενημερώνουμε ότι έγινε αίτημα για επαναφορά κωδικού πρόσβασης στον λογαριασμό που διατηρείτε στην διεύθυνση ${process.env.FRONT_DOMAIN}. \n\nΓια την επαναφορά του κωδικού πρόσβασης, επισκεφτείτε τον σύνδεσμο που ακολουθεί ${resetUrl} \n\nΕαν το αίτημα δεν πραγματοποιήθηκε από εσάς, μπορείτε να αγνοήσετε αυτό το μήνυμα με ασφάλεια. \nΟ παραπάνω σύνδεσμος θα είναι έγκυρος για μια δέκα λεπτά.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Επαναφορά κωδικού',
      message,
    });
    res.status(200).json({ success: true, data: 'Επιτυχής αποστολή!' });
  } catch (err) {
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    return next(new ErrorResponse('Αποτυχία επαναφοράς κωδικού', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetpassword = asyncHandler(async (req, res, next) => {
  //Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await Users.findOne({
    where: {
      resetPasswordToken,
      resetPasswordToken: { [Op.gt]: new Date(Date.now()) },
    },
  });

  if (!user) {
    return next(new ErrorResponse('Μη έγκυρος σύνδεσμος', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;

  await user.save();

  res.status(200).json({
    success: true,
    data: 'Επιτυχής ενημέρωση κωδικού!',
  });
});

//Helper Function
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
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

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
