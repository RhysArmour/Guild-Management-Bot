const Sequelize = require('sequelize');

const sequelize = new Sequelize('test-db', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite',
});

module.exports = {
  sequelize,
};
