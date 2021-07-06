const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const sequelize = require('./config/database');

//Import Models
const Users = require('./models/User');
const Quiz = require('./models/Quiz');

//Creating associations

//quiz_ps
Users.hasMany(Quiz, {
  foreignKey: 'user_id',
});
Quiz.belongsTo(Users, { foreignKey: 'user_id' });

//Route files
const quizzes = require('./routes/quizzes');
const users = require('./routes/users');

// Load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

//Body parser
app.use(express.json());

//Dev Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Mount routers
app.use('/api/v1/quizzes', quizzes);
app.use('/api/v1/users', users);

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
