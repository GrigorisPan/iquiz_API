const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const SuggestQuiz = require('../models/SuggestQuiz');
const Quiz = require('../models/Quiz');
const DigitalClass = require('../models/DigitalClass');

//  @desc     Get suggest quizzes by specific class id
//  @route    GET /api/v1/suggestquiz/:id
//  @access   Private (Teacher + Admin + Student)
exports.getSuggestQuiz = asyncHandler(async (req, res, next) => {
  id = +req.params.id;
  const suggestquiz = await SuggestQuiz.findAll({
    where: { class_id: id },
    include: [{ model: Quiz }],
  });

  res
    .status(200)
    .json({ success: true, count: suggestquiz.length, data: suggestquiz });
});

//  @desc     Get the available digital classes for the suggest quiz with a specific quiz ID
//  @route    GET /api/v1/suggestquiz/available/:id
//  @access   Private (Teacher + Admin)
exports.getAvalDigitalClassesSuggest = asyncHandler(async (req, res, next) => {
  const quiz_id = +req.params.id;
  const user_id = +req.user.id;
  const type = +req.user.type;

  if (type === 1 || type === 2) {
    // Find Digital Classes belonging to the specific user
    const digitalClass = await DigitalClass.findAll({ where: { user_id } });

    const dClasses = digitalClass.map((data, id) => {
      return data.id;
    });
    console.log(dClasses);
    if (!dClasses) {
      res.status(201).json({
        success: true,
        data: [],
      });
    }

    // Find unavailable ids of the digital classes for specific quiz ID
    const exceptClassesIds = await SuggestQuiz.findAll({ where: { quiz_id } });
    console.log(exceptClassesIds);

    const exceptIds = exceptClassesIds.map((data) => {
      return data.class_id;
    });
    console.log(exceptIds);

    //Find available ids of the digital classes for specific quiz ID
    const acceptIds = dClasses.filter((id) => !exceptIds.includes(id));
    //console.log(acceptIds);

    res.status(201).json({
      success: true,
      data: acceptIds,
    });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to create suggest quiz`, 401)
    );
  }
});

//  @desc     Add suggest quiz
//  @route    PUT /api/v1/suggestquiz/add
//  @access   Private (Teacher + Admin)
exports.addSuggestQuiz = asyncHandler(async (req, res, next) => {
  const user_id = +req.user.id;
  const class_id = +req.body.class_id;
  const type = +req.user.type;

  if (type === 1 || type === 2) {
    const digitalClass = await DigitalClass.findAll({ where: { user_id } });

    const dClasses = digitalClass.map((data, id) => {
      return data.id;
    });

    //console.log(dClasses); Digital classes belonging to the specific user

    if (dClasses.includes(class_id)) {
      const suggestquiz = await SuggestQuiz.create(req.body);
      //console.log(suggestquiz);

      res.status(201).json({
        success: true,
        data: suggestquiz,
      });
    } else {
      return next(
        new ErrorResponse(
          `Not authorized to create suggest quiz for that digital class`,
          401
        )
      );
    }
  } else {
    return next(
      new ErrorResponse(`User is not authorized to create suggest quiz`, 401)
    );
  }
});
