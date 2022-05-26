const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Users = sequelize.define(
  'users_ps',
  {
    username: {
      type: Sequelize.STRING(25),
      allowNull: false,
      validate: {
        notNull: { msg: ' Το όνομα χρήστη είναι υποχρεωτικό' },
        notEmpty: { msg: ' Το όνομα χρήστη δεν πρέπει να είναι κενό' },
      },
    },
    password: {
      type: Sequelize.STRING(250),
      allowNull: false,
      validate: {
        notNull: { msg: ' Πρέπει να εισαγάγετε ένα passowrd' },
        notEmpty: { msg: ' Ο κωδικός πρόσβασης δεν μπορεί να είναι κενός' },
      },
    },
    refreshToken: {
      type: Sequelize.STRING(),
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
        notNull: { msg: ' Ο χρήστης πρέπει να ανήκει σε κάτηγορία' },
        notEmpty: { msg: ' Η κατηγορία χρήστη δεν μπορεί να είναι κένη' },
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
      unique: {
        args: true,
        msg: 'Αυτή η διεύθυνση ηλεκτρονικού ταχυδρομείου χρησιμοποιείται ήδη',
      },
      validate: {
        notNull: { msg: ' Το ηλεκτρονικό ταχυδρομείο είναι υποχρεωτικό' },
        notEmpty: {
          msg: ' Το ηλεκτρονικό ταχυδρομείο δεν πρέπει να είναι κενό',
        },
        isEmail: { msg: ' Το ηλεκτρονικό ταχυδρομείο δεν είναι έγκυρο' },
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
      beforeSave: async function (User, next) {
        if (User.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          User.password = await bcrypt.hash(User.password, salt);
        }
      },
    },
  }
);
//Sign JWT and return
Users.prototype.getSignedJwtToken = function () {
  //Generate token
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Refresh JWT and return
Users.prototype.getRefreshJwtToken = function () {
  //Generate token
  const refreshToken = jwt.sign(
    { id: this.id },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE,
    }
  );

  //Hash token and set to refreshToken field DB
  this.refreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');
  return refreshToken;
};

//Reset password JWT
Users.prototype.getResetToken = function () {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  //Hash token ans set resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //Set expire (10 min)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

//Match user entered password to hashed password in database
Users.prototype.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Users;
