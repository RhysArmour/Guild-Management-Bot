const Sequelize = require('sequelize');
const { botDb } = require('./bot-db')
const { sequelize } = require('./sequelize');

const guildDb = sequelize.define('guildDb', {
  Name: {
    type: Sequelize.STRING,
  },
  Strikes: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  TotalStrikes: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  UniqueId: {
    type: Sequelize.STRING
  },
  ServerId: {
    type: Sequelize.STRING
  }
});

const checkRoomsAreAssigned = async (serverId) => {
  const record = await botDb.findOne({
    where: { Name: 'Strike Channel', ServerId: serverId },
  });
  if (!record) {
    const reply = 'You must set Offense Channel and Strike Channel before issuing strikes.'
    return reply
  }
  return true
}

const assignStrikes = async (user, serverId) => {
  const duplicate = await guildDb.findOne({
    where: { Name: user.username, UniqueId: user.id, ServerId: serverId },
  });
  console.log('DUPLICATE', duplicate)
  if (!duplicate) {
    console.log('CREATING ENTRY')
    return guildDb.create({
      Name: user.username,
      Strikes: 1,
      TotalStrikes: 1,
      UniqueId: user.id,
      ServerId: serverId,
    })
  } else {
    return updateStrike(user, serverId);
  }
};

const updateStrike = async (user, serverId) => {
  console.log('UPDATE STRIKES FOR', user)
  await guildDb.increment('Strikes', { by: 1, where: { Name: user.username, UniqueId: user.id, ServerId: serverId } });
  await guildDb.increment('TotalStrikes', { by: 1, where: { Name: user.username, UniqueId: user.id, ServerId: serverId } });
  return guildDb.findOne({ where: { Name: user.username, UniqueId: user.id, ServerId: serverId } });
};

const getStrikes = async (user, serverId) => {
  const record = await guildDb.findOne({
    where: { Name: user.username, UniqueId: user.id, ServerId: serverId },
  });
  const strikes = record.Strikes;
  return strikes;
};

module.exports = {
  sequelize,
  guildDb,
  assignStrikes,
  updateStrike,
  getStrikes,
  checkRoomsAreAssigned,
};
