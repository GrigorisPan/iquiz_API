const Sequelize = require('sequelize');

const sequelize = require('../config/database');
const SuggestQuiz = sequelize.define('suggest_quiz_ps', {
  class_id: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    allowNull: false,
  },
  quiz_id: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    allowNull: false,
  },
});

module.exports = SuggestQuiz;
