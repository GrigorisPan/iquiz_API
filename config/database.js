const Sequelize = require('sequelize');

const sequelize = new Sequelize('iquiz_db', 'root', '', {
  dialect: 'mysql',
  host: 'localhost',
});

module.exports = sequelize;
