const fs = require('fs');
const colors = require('colors');
const sequelize = require('./config/database');

//Load models
const Quiz = require('./models/Quiz');
const User = require('./models/User');
const Statistic = require('./models/Statistic');
const Report = require('./models/Report');
const DigitalClass = require('./models/DigitalClass');
const SuggestQuiz = require('./models/SuggestQuiz');
//const UsersInClass = require('./models/UsersInClass');
const InClass = require('./models/InClass');
//Read JSON files
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);
const quizzes = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/quizzes.json`, 'utf-8')
);
const statistics = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/statistics.json`, 'utf-8')
);
const reports = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reports.json`, 'utf-8')
);
const digital_class = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/digital_class.json`, 'utf-8')
);
const suggest_quiz = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/suggest_quiz.json`, 'utf-8')
);
const users_inclass = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users_inclass.json`, 'utf-8')
);

const importData = async () => {
  try {
    /*     await User.bulkCreate(users, { validate: true });
     */ await Quiz.bulkCreate(quizzes, { validate: true });
    await Statistic.bulkCreate(statistics, { validate: true });
    await Report.bulkCreate(reports, { validate: true });
    await DigitalClass.bulkCreate(digital_class, { validate: true });
    await SuggestQuiz.bulkCreate(suggest_quiz, { validate: true });
    await InClass.bulkCreate(users_inclass, { validate: true });
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await InClass.destroy({
      where: {},
    });
    await SuggestQuiz.destroy({
      where: {},
    });
    await DigitalClass.destroy({
      where: {},
    });
    await Report.destroy({
      where: {},
    });
    await Statistic.destroy({
      where: {},
    });
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
