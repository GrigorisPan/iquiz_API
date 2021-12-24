const path = require('path');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Quiz = require('../models/Quiz');
const Users = require('../models/User');

//  @desc     Get all public quizzes (Public)
//  @route    GET /api/v1/quizzes
//  @access   Private (Student & Teacher & Admin)
exports.getQuizzes = asyncHandler(async (req, res, next) => {
  const quizzes = await Quiz.findAll({
    where: { status: 'public' },
    include: [{ model: Users }],
  });
  res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
});

//  @desc     Get all quizzes (Public + Private)
//  @route    GET /api/v1/quizzes/all
//  @access   Private (Teacher & Admin)
exports.getAllQuizzes = asyncHandler(async (req, res, next) => {
  //console.log(req.user.type);
  const type = +req.user.type;
  const id = +req.user.id;

  if (type === 2) {
    const quizzes = await Quiz.findAll({
      where: [{ user_id: id }],
      include: [{ model: Users }],
    });
    res
      .status(200)
      .json({ success: true, count: quizzes.length, data: quizzes });
  }
  if (type === 1) {
    const quizzes = await Quiz.findAll({
      include: [{ model: Users }],
    });
    res
      .status(200)
      .json({ success: true, count: quizzes.length, data: quizzes });
  }
});

//  @desc     Get single public quiz (Public)
//  @route    GET /api/v1/quizzes/:id
//  @access   Private  (Student & Teacher & Admin)
exports.getQuiz = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const quiz = await Quiz.findOne({
    where: { id, status: 'public' },
    include: [{ model: Users }],
  });
  if (!quiz) {
    return next(
      new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: quiz });
});

//  @desc     Get single quiz for library (Public + Private)
//  @route    GET /api/v1/quizzes/all/:id
//  @access   Private  (Teacher & Admin)
exports.getAllQuiz = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const user_id = +req.user.id;
  const type = +req.user.type;
  if (type === 2) {
    const quiz = await Quiz.findOne({
      where: { id, user_id },
      include: [{ model: Users }],
    });
    if (!quiz) {
      return next(
        new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ success: true, data: quiz });
  }
  if (type === 1) {
    const quiz = await Quiz.findOne({
      where: { id },
      include: [{ model: Users }],
    });
    if (!quiz) {
      return next(
        new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ success: true, data: quiz });
  }
});

//  @desc     Create new quiz
//  @route    POST /api/v1/quizzes
//  @access   Private (Teacher & Admin)
exports.createQuiz = asyncHandler(async (req, res, next) => {
  req.body.user_id = req.user.id;
  const type = +req.user.type;
  if (type === 2 || type === 1) {
    const quiz = await Quiz.create(req.body);
    console.log(quiz);

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to create quiz`, 401)
    );
  }
});

//  @desc     Update quiz
//  @route    PUT /api/v1/quizzes/:id
//  @access   Private (Teacher & Admin)
exports.updateQuiz = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const type = +req.user.type;

  if (type === 2 || type === 1) {
    const { title, description, time, questions_otp, photo, status } = req.body;

    const quiz = await Quiz.findOne({ where: { id } });

    if (!quiz) {
      return next(
        new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
      );
    }
    if (type === 2 && quiz.user_id !== req.user.id) {
      return next(
        new ErrorResponse(
          `User is not authorized to update this quiz with id:${req.params.id}`,
          401
        )
      );
    }
    quiz.user_id = req.user.id;
    quiz.title = title;
    quiz.description = description;
    quiz.time = time;
    quiz.questions_otp = questions_otp;
    quiz.photo = photo;
    quiz.status = status;

    await quiz.save();

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to create quiz`, 401)
    );
  }
});

//  @desc     Delete quiz
//  @route    DELETE /api/v1/quizzes/:id
//  @access   Private (Teacher & Admin)
exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const type = +req.user.type;

  if (type === 2 || type === 1) {
    const quiz = await Quiz.findOne({
      where: { id },
    });
    if (!quiz) {
      return next(
        new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
      );
    }

    if (type === 2 && quiz.user_id !== req.user.id) {
      return next(
        new ErrorResponse(
          `User is not authorized to update this quiz with id:${req.params.id}`,
          401
        )
      );
    }
    await quiz.destroy();

    res.status(200).json({ message: 'Επιτυχής διαγραφή!' });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to create quiz`, 401)
    );
  }
});

//  @desc     Upload photo for quiz
//  @route    PUT /api/v1/quizzes/:id/photo
//  @access   Private (Teacher & Admin)
exports.quizPhotoUpload = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const type = +req.user.type;

  if (type === 2 || type === 1) {
    const quiz = await Quiz.findOne({
      where: { id },
    });
    if (!quiz) {
      return next(
        new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
      );
    }
    if (type === 2 && quiz.user_id !== req.user.id) {
      return next(
        new ErrorResponse(
          `User is not authorized to update this quiz with id:${req.params.id}`,
          401
        )
      );
    }
    if (!req.files) {
      return next(new ErrorResponse('Παρακαλώ εισάγετε εικόνα', 400));
    }

    //console.log(req.files.file);

    const file = req.files.file;

    //Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return next(
        new ErrorResponse(
          'Παρακαλώ επιλέξτε αρχείο με κατάληξη (.png/.jpg/.jpeg)',
          400
        )
      );
    }

    //Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Παρακαλώ επιλέξτε εικόνα μικρότερη από ${
            process.env.MAX_FILE_UPLOAD / 1048576
          }GB`,
          400
        )
      );
    }

    //Create custom filename
    file.name = `img${quiz.id}_${Date.parse(quiz.createdAt)}${
      path.parse(file.name).ext
    }`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
      if (err) {
        //console.log(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }

      await quiz.update({ photo: file.name });
      res.status(200).json({
        success: true,
        data: file.name,
      });
    });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to create quiz`, 401)
    );
  }
  //console.log(file.name);
});
