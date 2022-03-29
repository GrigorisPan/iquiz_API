const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Statistic = sequelize.define('statistic_ps', {
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
  score_avg: {
    type: Sequelize.INTEGER(15),
    allowNull: false,
  },
  correct_avg: {
    type: Sequelize.INTEGER(5),
    allowNull: false,
  },
  false_avg: {
    type: Sequelize.INTEGER(5),
    allowNull: false,
  },
  play_count: {
    type: Sequelize.INTEGER(5),
    allowNull: false,
  },
  save_flag: {
    type: Sequelize.BOOLEAN,
  },
});

module.exports = Statistic;
