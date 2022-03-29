const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  //console.log(req.params.id);
  error.message = err.message;

  console.log(err.stack.red);

  if (err.name === 'TypeError') {
    const message = `Δεν βρέθηκαν πόροι`;
    error = new ErrorResponse(message, 404);
  }
  if (err.name === 'ReferenceError') {
    const message = `Δεν βρέθηκαν πόροι`;
    error = new ErrorResponse(message, 404);
  }

  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 404);
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    //console.log(error.errors[0].message);
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }
  if (err.name === 'SyntaxError') {
    const message = 'Σφάλμα αιτήματος';
    error = new ErrorResponse(message, 400);
  }
  if (err.name === 'SequelizeDatabaseError') {
    const message = 'Λάθος id';
    error = new ErrorResponse(message, 400);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Σφάλμα διακομιστή!',
  });
};

module.exports = errorHandler;
