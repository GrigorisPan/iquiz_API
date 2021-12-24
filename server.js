const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const sequelize = require('./config/database');

//Import Models
const Users = require('./models/User');
const Quiz = require('./models/Quiz');
const Statistic = require('./models/Statistic');
const Reports = require('./models/Report');
const DigitalClass = require('./models/DigitalClass');
const SuggestQuiz = require('./models/SuggestQuiz');

//Creating associations

//quiz_ps
Users.hasMany(Quiz, {
  foreignKey: 'user_id',
});
Quiz.belongsTo(Users, { foreignKey: 'user_id' });

//quiz_statistic_ps
Quiz.belongsToMany(Users, {
  through: 'statistic_ps',
  foreignKey: 'quiz_id',
});
Users.belongsToMany(Quiz, {
  through: 'statistic_ps',
  foreignKey: 'user_id',
});
Statistic.belongsTo(Users, { foreignKey: 'user_id' });

//reports_ps
Quiz.belongsToMany(Users, {
  through: 'reports_ps',
  foreignKey: 'quiz_id',
});
Users.belongsToMany(Quiz, {
  through: 'reports_ps',
  foreignKey: 'user_id',
});

//digital_class_ps
Users.hasMany(DigitalClass, {
  foreignKey: 'user_id',
});
DigitalClass.belongsTo(Users, { foreignKey: 'user_id' });

//suggest_quiz_ps
Quiz.belongsToMany(DigitalClass, {
  through: 'suggest_quiz_ps',
  foreignKey: 'quiz_id',
});
DigitalClass.belongsToMany(Quiz, {
  through: 'suggest_quiz_ps',
  foreignKey: 'class_id',
});
SuggestQuiz.belongsTo(Quiz, {
  foreignKey: 'quiz_id',
});
//users_inclass_ps
Users.belongsToMany(DigitalClass, {
  through: 'users_inclass_ps',
  foreignKey: 'user_id',
});
DigitalClass.belongsToMany(Users, {
  through: 'users_inclass_ps',
  foreignKey: 'class_id',
});
//Route files
const auth = require('./routes/auth');
const quizzes = require('./routes/quizzes');
const users = require('./routes/users');
const statistics = require('./routes/statistics');
const reports = require('./routes/reports');
const digital_class = require('./routes/digital_class');
const suggest_quiz = require('./routes/suggest_quiz');

// Load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Dev Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//File uploading
app.use(fileupload());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Mount routers
app.use('/api/v1/auth/', auth);
app.use('/api/v1/quizzes', quizzes);
app.use('/api/v1/users', users);
app.use('/api/v1/statistics', statistics);
app.use('/api/v1/reports', reports);
app.use('/api/v1/digitalclass', digital_class);
app.use('/api/v1/suggestquiz', suggest_quiz);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}.`.yellow
      .bold
  );
  const result = await sequelize.sync();
  console.log('Database Connnected!'.cyan.underline.bold);
  //console.log(result);
});

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  // Close server & exit process
  server.close(() => process.exit(1));
});
