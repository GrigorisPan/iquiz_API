//  @desc     Get all quizzes
//  @route    GET /api/v1/quizzes
//  @access   Private
exports.getQuizzes = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Show all quizzes.' });

  /*  res
    .status(200)
    .json({ success: true, count: quizzes.length, pagination, data: quizzes }); */
};

//  @desc     Get single quiz
//  @route    GET /api/v1/quizzes/:id
//  @access   Private
exports.getQuiz = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Show quiz ${req.params.id}.` });

  /* res.status(200).json({success: true, data: quiz}); */
};

//  @desc     Create new quiz
//  @route    POST /api/v1/quizzes
//  @access   Private
exports.createQuiz = (req, res, next) => {
  //console.log(req.body);
  res.status(200).json({ success: true, msg: 'Create a new quiz.' });
  /*  const quiz = await Quiz.create(req.body);
  //console.log(quiz);
  res.status(201).json({
     success: true,
     data: quiz
  }); */

  //res.status(400).json({success:false});
};

exports.updateQuiz = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Update quiz ${req.params.id}.` });

  /*   const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!quiz) {
    return next(
      new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: quiz });

  //res.status(400).json({success: false}); */
};

//  @desc     Delete quiz
//  @route    DELETE /api/v1/quizzes/:id
//  @access   Private
exports.deleteQuiz = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Delete quiz ${req.params.id}.` });
  /*     const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if(!quiz){
      //console.log(quiz);
      return next(new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({success: true, data: {} });
    //res.status(400).json({success: false});
    next(err); */
};
