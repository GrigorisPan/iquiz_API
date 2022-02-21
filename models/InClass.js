const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const InClass = sequelize.define('inclass_ps', {
  user_id: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    allowNull: false,
  },
  class_id: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    allowNull: false,
  },
});

module.exports = InClass;
