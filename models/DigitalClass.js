const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const DigitalClass = sequelize.define('digital_class_ps', {
  id: {
    type: Sequelize.INTEGER(11),
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
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
});

module.exports = DigitalClass;
