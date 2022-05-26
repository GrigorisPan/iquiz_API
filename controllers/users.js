const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Quiz = require('../models/Quiz');
const Users = require('../models/User');

//  @desc     Get all users
//  @route    GET /api/v1/users
//  @access   Private (Admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;

  if (type === 1) {
    const users = await Users.findAll({
      attributes: { exclude: ['refreshToken', 'resetPasswordToken'] },
    });
    res.status(200).json({ success: true, count: users.length, data: users });
  } else {
    return next(
      new ErrorResponse(`Ο χρήστης δεν έχει δικαίωμα να λάβει χρήστες`, 401)
    );
  }
});

//  @desc     Get single user
//  @route    GET /api/v1/users/:id
//  @access   Private (Teacher + Admin + Student)
exports.getUser = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const user = await Users.findOne({
    where: { id },
    include: [{ model: Quiz }],
    attributes: {
      exclude: ['refreshToken', 'resetPasswordToken', 'resetPasswordExpire'],
    },
  });

  if (!user) {
    return next(
      new ErrorResponse(`Ο χρήστης δεν βρέθηκε με id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: user });
});

//  @desc     Create new user
//  @route    POST /api/v1/users
//  @access   Private
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await Users.create(req.body);
  //console.log(user);
  res.status(201).json({
    success: true,
    data: user,
  });
});

//  @desc     Update user
//  @route    PUT /api/v1/users/:id
//  @access   Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  let id;
  const user_type = +req.user.type;
  let username;
  let email;
  let password;
  let type;

  if (user_type === 0 || user_type === 2) {
    id = +req.user.id;
    username = req.body.username;
    email = req.body.email;
    password = req.body.password;
  } else if (user_type === 1) {
    id = +req.params.id;
    username = req.body.username;
    email = req.body.email;
    password = req.body.password;
    type = +req.body.type;
  } else {
    return next(
      new ErrorResponse(
        `Ο χρήστης δεν έχει δικαίωμα να ενημερώσει στοιχεία του χρήστη`,
        401
      )
    );
  }

  const user = await Users.findOne({
    where: { id },
    attributes: {
      include: ['password'],
    },
  });

  if (!user) {
    return next(
      new ErrorResponse(`Δεν βρέθηκε ο χρήστης με κωδικό ${req.params.id}`, 404)
    );
  }

  //console.log(user.password);

  if (user) {
    if (user_type === 0 || user_type === 2) {
      user.username = username || user.username;
      user.email = email || user.email;
    } else {
      user.username = username || user.username;
      user.email = email || user.email;
      user.type = type || type === 0 ? type : user.type;
    }

    if (password) {
      user.password = password;
    }
  }
  await user.save();
  const updatedUser = await Users.findOne({
    where: { id },
    attributes: {
      exclude: ['refreshToken', 'resetPasswordToken', 'resetPasswordExpire'],
    },
  });
  res.status(201).json({
    success: true,
    data: updatedUser,
  });
});

//  @desc     Delete user
//  @route    DELETE /api/v1/users/:id
//  @access   Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const type = +req.user.type;

  if (type === 1) {
    const user = await Users.findOne({
      where: { id },
    });
    if (!user) {
      return next(
        new ErrorResponse(
          `Δεν βρέθηκε ο χρήστης με κωδικό ${req.params.id}`,
          404
        )
      );
    }
    await user.destroy();

    res.status(200).json({ message: 'Επιτυχής διαγραφή!' });
  } else {
    return next(
      new ErrorResponse(`Ο χρήστης δεν έχει δικαίωμα να διαγράψει χρήστη`, 401)
    );
  }
});
