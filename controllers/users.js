const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Quiz = require('../models/Quiz');
const Users = require('../models/User');

//  @desc     Get all users
//  @route    GET /api/v1/users
//  @access   Private
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await Users.findAll();
  res.status(200).json({ success: true, count: users.length, data: users });
});

//  @desc     Get single user
//  @route    GET /api/v1/users/:id
//  @access   Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const user = await Users.findOne({
    where: { id },
    include: [{ model: Quiz }],
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: user });
});

//  @desc     Create new user
//  @route    POST /api/v1/users
//  @access   Private
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await Users.create(req.body);
  console.log(user);
  res.status(201).json({
    success: true,
    data: user,
  });
});

//  @desc     Update user
//  @route    PUT /api/v1/users/:id
//  @access   Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const { username, email, password } = req.body;

  const user = await Users.findOne({
    where: { id },
    attributes: {
      include: ['password'],
    },
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  console.log(user.password);
  if (user) {
    user.username = username || user.username;
    user.email = email || user.email;

    if (password) {
      user.password = password;
    }
  }
  await user.save();
  const updatedUser = await Users.findOne({
    where: { id },
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

  const user = await Users.findOne({
    where: { id },
  });
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }
  await user.destroy();

  res.status(200).json({ message: 'User deleted!' });
});
