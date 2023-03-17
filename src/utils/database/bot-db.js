const Sequelize = require('sequelize');
const { sequelize } = require('./sequelize');

const botDb = sequelize.define('botDb', {
  Name: {
    type: Sequelize.STRING,
  },
  Description: {
    type: Sequelize.STRING,
  },
  Value: {
    type: Sequelize.STRING,
  },
  UniqueId: {
    type: Sequelize.STRING,
  },
  ServerId: {
    type: Sequelize.STRING,
  },
});

module.exports = {
  botDb,
};

const getAwayRole = async (serverId) => {
  const awayRole = await botDb.findOne({
    where: { Name: 'Away Role', ServerId: serverId },
  });
  return awayRole
};

module.exports = {
  botDb,
  getAwayRole,
};
