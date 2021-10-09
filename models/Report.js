const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Reports = sequelize.define('reports_ps', {
  user_id: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    allowNull: false,
  },
  quiz_id: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    allowNull: false,
  },
  question_num: {
    type: Sequelize.INTEGER(5),
    allowNull: false,
  },
});

module.exports = Reports;
