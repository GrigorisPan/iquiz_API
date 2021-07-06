const fs = require('fs');
const colors = require('colors');
const sequelize = require('./config/database');

//Load models
const Quiz = require('./models/Quiz');
const User = require('./models/User');

//Read JSON files
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);
const quizzes = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/quizzes.json`, 'utf-8')
);

const importData = async () => {
  try {
    await User.bulkCreate(users, { validate: true });
    await Quiz.bulkCreate(quizzes, { validate: true });
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Quiz.destroy({
      where: {},
    });
    await User.destroy({
      where: {},
    });
    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
