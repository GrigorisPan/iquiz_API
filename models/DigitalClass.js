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
    unique: {
      args: true,
      msg: 'Ο τίτλος πρέπει να είναι μοναδικός',
    },
    validate: {
      notNull: { msg: ' Λάθος τίτλος' },
      notEmpty: { msg: ' Εισάγετε τίτλο' },
    },
  },
  description: {
    type: Sequelize.STRING(300),
    allowNull: false,
    validate: {
      notNull: { msg: ' Λάθος περιγραφή' },
      notEmpty: { msg: ' Εισάγετε περιγραφή ' },
    },
  },
});

module.exports = DigitalClass;
