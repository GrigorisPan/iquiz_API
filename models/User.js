const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = sequelize.define(
  'users_ps',
  {
    username: {
      type: Sequelize.STRING(25),
      allowNull: false,
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
    resetPasswordToken: {
      type: Sequelize.STRING(),
    },
    resetPasswordExpire: {
      type: Sequelize.DATE(),
    },
    aem: {
      type: Sequelize.INTEGER(8),
    },
    activated: {
      type: Sequelize.INTEGER(1),
    },
    type: {
      type: Sequelize.INTEGER(1),
      allowNull: false,
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
    },
    academicid: {
      type: Sequelize.BIGINT(12),
    },
    public_comment: {
      type: Sequelize.STRING(256),
    },
    private_comment: {
      type: Sequelize.STRING(256),
    },
    departmentid: {
      type: Sequelize.INTEGER(11),
    },
  },
  {
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    hooks: {
      beforeCreate: async function (User) {
        console.log('Encrypt Passsword');
        const salt = await bcrypt.genSalt(10);
        User.password = await bcrypt.hash(User.password, salt);
      },
    },
  }
);
//Sign JWT and return
Users.prototype.getSignedJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Match user entered password to hashed password in database
Users.prototype.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Users;
