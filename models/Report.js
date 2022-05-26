const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Reports = sequelize.define('reports_ps', {
  id: {
    type: Sequelize.INTEGER(11),
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  quiz_id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  question: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
});

module.exports = Reports;
