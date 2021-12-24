const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const UsersInClass = sequelize.define('users_inclass_ps', {
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

module.exports = UsersInClass;
