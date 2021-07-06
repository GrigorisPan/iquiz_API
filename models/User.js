const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Users = sequelize.define('users_ps', {
  username: {
    type: Sequelize.STRING(25),
    allowNull: false,
    unique: true,
    validate: {
      notNull: { msg: 'User must have a name' },
      notEmpty: { msg: 'Username must not be empty.' },
    },
  },
  password: {
    type: Sequelize.STRING(250),
    allowNull: false,
    validate: {
      notNull: { msg: 'You must insert a passowrd' },
      notEmpty: { msg: 'Password cant be empty.' },
    },
  },
  aem: {
    type: Sequelize.INTEGER(8),
    allowNull: false,
    unique: true,
    validate: {
      notNull: { msg: 'User must have a aem' },
      notEmpty: { msg: 'Aem code must not be empty.' },
    },
  },
  activated: {
    type: Sequelize.INTEGER(1),
    allowNull: false,
    defaultValue: 0,
  },
  type: {
    type: Sequelize.INTEGER(1),
    allowNull: false,
    defaultValue: 0,
    validate: {
      notNull: { msg: 'User must have a role' },
      notEmpty: { msg: 'Role must not be empty.' },
    },
  },
  id: {
    type: Sequelize.INTEGER(11),
    autoIncrement: true,
    primaryKey: true,
  },
  last_name: {
    type: Sequelize.STRING(25),
  },
  first_name: {
    type: Sequelize.STRING(25),
  },
  act_code: {
    type: Sequelize.STRING(30),
  },
  email: {
    type: Sequelize.STRING(30),
    allowNull: false,
    defaultValue: 0,
    unique: true,
    validate: {
      notNull: { msg: 'User must have a email' },
      notEmpty: { msg: 'Email must not be empty.' },
      isEmail: { msg: 'Must be a valid email address' },
    },
  },
  telephone: {
    type: Sequelize.BIGINT(10),
    unique: true,
  },
  academicid: {
    type: Sequelize.BIGINT(12),
    unique: true,
  },
  public_comment: {
    type: Sequelize.STRING(256),
  },
  private_comment: {
    type: Sequelize.STRING(256),
  },
  departmentid: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Users;
