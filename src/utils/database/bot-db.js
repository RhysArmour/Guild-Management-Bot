const Sequelize = require('sequelize');
const { sequelize } = require('./sequelize')

const botDb = sequelize.define('botDb', {
  Name: {
    type: Sequelize.STRING,
    unique: true,
  },
  Description: {
    type: Sequelize.STRING,
    unique: true,
  },
  Value: {
    type: Sequelize.STRING,
    unique: true,
  },
  UniqueId: {
    type: Sequelize.STRING
  },
  ServerId: {
    type: Sequelize.STRING
  }
});

module.exports = {
    botDb
}