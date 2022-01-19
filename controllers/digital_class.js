const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const DigitalClass = require('../models/DigitalClass');
const UsersInClass = require('../models/UsersInClass');

//  @desc     Get digital classes
//  @route    GET /api/v1/digitalclass/
//  @access   Private (Admin)
exports.getDigitalClassListAll = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;

  if (type === 1) {
    const digitalClass = await DigitalClass.findAll({});

    res
      .status(200)
      .json({ success: true, count: digitalClass.length, data: digitalClass });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to get digital classes`, 401)
    );
  }
});

//  @desc     Delete digital class
//  @route    DELETE /api/v1/digitalclass/:id
//  @access   Private (Admin)
exports.deleteDigitalClass = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const type = +req.user.type;

  if (type === 1) {
    const dClass = await DigitalClass.findOne({
      where: { id },
    });
    if (!dClass) {
      return next(
        new ErrorResponse(
          `Digital Class not found with id of ${req.params.id}`,
          404
        )
      );
    }
    await dClass.destroy();

    res.status(200).json({ message: 'Digital Class deleted!' });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to delete a digital class`, 401)
    );
  }
});

//  @desc     Get digital classes by specific user id
//  @route    GET /api/v1/digitalclass/user/
//  @access   Private
exports.getDigitalClassList = asyncHandler(async (req, res, next) => {
  const id = req.user.id;
  const type = +req.user.type;

  if (type === 2 || type === 1) {
    const digitalClass = await DigitalClass.findAll({ where: { user_id: id } });

    res
      .status(200)
      .json({ success: true, count: digitalClass.length, data: digitalClass });
  } else if (type === 0) {
    const digitalClass = await DigitalClass.findAll();
    const userInClass = await UsersInClass.findAll({ where: { user_id: id } });
    //console.log(userInClass);

    const dClass = [];
    for (i = 0; i < userInClass.length; i++) {
      for (j = 0; j < digitalClass.length; j++) {
        if (digitalClass[j].id === userInClass[i].class_id) {
          dClass[i] = digitalClass[j];
          break;
        }
      }
    }

    //console.log(dClass);

    res
      .status(200)
      .json({ success: true, count: digitalClass.length, data: dClass });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to get digital classes`, 401)
    );
  }
});

//  @desc     Get digital class by specific class id
//  @route    GET /api/v1/digitalclass/:id
//  @access   Private
exports.getDigitalClass = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const user_id = +req.user.id;
  const type = +req.user.type;
  console.log(type);

  if (type === 2 || type === 1) {
    const digitalClass = await DigitalClass.findAll({ where: { id } });

    if (digitalClass.length === 0 || !digitalClass) {
      return next(
        new ErrorResponse(
          `Digital Class not found with id of ${req.params.id}`,
          404
        )
      );
    }

    if (type === 2 && digitalClass[0].dataValues.user_id !== req.user.id) {
      return next(new ErrorResponse('Not authorize to access this route', 401));
    }

    res.status(200).json({ success: true, data: digitalClass });
  } else if (type === 0) {
    const digitalClass = await DigitalClass.findAll({ where: { id } });

    if (digitalClass.length === 0 || !digitalClass) {
      return next(
        new ErrorResponse(
          `Digital Class not found with id of ${req.params.id}`,
          404
        )
      );
    }

    const belongClass = await UsersInClass.findAll({
      where: { user_id, class_id: id },
    });
    if (belongClass.length === 0 || !belongClass) {
      return next(new ErrorResponse('Not authorize to access this route', 401));
    }

    res.status(200).json({ success: true, data: digitalClass });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to get digital classes`, 401)
    );
  }
});

//  @desc     Create digital classes
//  @route    POST /api/v1/digitalclass/create/
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

//  @desc     Enroll in a digital classroom
//  @route    POST /api/v1/digitalclass/enroll/
//  @access   Private (Student)
exports.enrollDigitalClass = asyncHandler(async (req, res, next) => {
  const type = +req.user.type;
  const class_id = +req.body.class_id;
  const user_id = +req.user.id;

  if (type === 0) {
    //Check if digital class id exists
    const digitalClass = await DigitalClass.findAll({
      where: { id: class_id },
    });
    if (!digitalClass || digitalClass.length === 0) {
      return next(
        new ErrorResponse(
          `Δεν βρέθηκε η ψηφιακή τάξη με κωδικό ${class_id}`,
          404
        )
      );
    }
    const ernollUserInClass = await UsersInClass.findAll({
      where: { user_id, class_id },
    });
    //console.log(ernollUserInClass, user_id, class_id);
    if (ernollUserInClass.length !== 0) {
      return next(
        new ErrorResponse(`Έχεις ήδη γραφτεί σε αυτήν την ψηφιακή τάξη`, 404)
      );
    }

    req.body.user_id = req.user.id;
    const usersInClass = await UsersInClass.create(req.body);
    res.status(201).json({ success: true, data: usersInClass });
  } else if (type === 1) {
    const usersInClass = await usersInClass.create(req.body);
    res.status(201).json({ success: true, data: usersInClass });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to create digital class`, 401)
    );
  }
});

//  @desc     Update digital class
//  @route    PUT /api/v1/digitalclass/:id
//  @access   Private (Admin)
exports.updateDigitalClass = asyncHandler(async (req, res, next) => {
  const id = +req.params.id;
  const type = +req.user.type;

  if (type === 1) {
    const { title, description } = req.body;

    const dClass = await DigitalClass.findOne({
      where: { id },
    });

    if (!dClass) {
      return next(
        new ErrorResponse(
          `Digital class not found with id of ${req.params.id}`,
          404
        )
      );
    }
    if (dClass) {
      dClass.title = title || dClass.title;
      dClass.description = description || dClass.description;
    }

    await dClass.save();
    const updatedDigitalClass = await DigitalClass.findOne({
      where: { id },
    });
    res.status(201).json({
      success: true,
      data: updatedDigitalClass,
    });
  } else {
    return next(
      new ErrorResponse(`User is not authorized to update digital class`, 401)
    );
  }
});
