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
  question: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
});

module.exports = Reports;
