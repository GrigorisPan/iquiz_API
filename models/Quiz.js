const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Quiz = sequelize.define('quiz_ps', {
  id: {
    type: Sequelize.INTEGER(11),
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: Sequelize.INTEGER(11),
    allowNull: true,
  },
  title: {
    type: Sequelize.STRING(25),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Ο τίτλος δεν πρέπει να είναι κενός' },
      notNull: { msg: 'Παρακαλώ εισάγετε τίτλο' },
    },
  },
  description: {
    type: Sequelize.STRING(300),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Η περιγραφή δεν πρέπει να είναι κενή' },
      notNull: { msg: 'Παρακαλώ εισάγετε περιγραφή' },
    },
  },
  time: {
    type: Sequelize.INTEGER(2),
    allowNull: false,
    validate: {
      isInt: { msg: 'Ο χρόνος πρέπει να είναι ακέραιος αριθμός' },
      notEmpty: { msg: 'Ο χρόνος δεν πρέπει να είναι κενός' },
      notNull: { msg: 'Παρακαλώ εισάγετε χρόνο' },
    },
  },
  questions_otp: {
    type: Sequelize.INTEGER(10),
    allowNull: false,
    unique: true,
    validate: {
      isInt: { msg: 'Ο κωδικός otp πρέπει να είναι ακέραιος αριθμός' },
      notEmpty: { msg: 'Ο κωδικός otp δεν πρέπει να είναι κενός' },
      notNull: { msg: 'Παρακαλώ εισάγετε κωδικό otp' },
    },
  },
  photo: {
    type: Sequelize.STRING,
    defaultValue: 'no-photo.jpg',
  },
  status: {
    type: Sequelize.STRING(10),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Η κατάσταση δεν πρέπει να είναι κενός' },
      notNull: { msg: 'Παρακαλώ εισάγετε κατάσταση' },
    },
  },
  start_date: {
    type: Sequelize.DATEONLY,
    defaultValue: null,
  },
  start_time: {
    type: Sequelize.TIME,
    defaultValue: null,
  },
  end_date: {
    type: Sequelize.DATEONLY,
    defaultValue: null,
  },
  end_time: {
    type: Sequelize.TIME,
    defaultValue: null,
  },
});

module.exports = Quiz;
