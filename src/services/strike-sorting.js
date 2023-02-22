const {
  getStrikes,
  guildDb,
  assignStrikes,
} = require('../utils/database/guild-db');
const { Collection } = require('discord.js');
const { botDb } = require('../utils/database/bot-db');

const isolateTags = (message) => {
  let listOfOffenders = message.mentions.users.map((user) => user.id);
  for (i in listOfOffenders) {
    listOfOffenders[i] = '<@' + listOfOffenders + '>';
  }
  return listOfOffenders;
};

const isolateTickets = (message) => {
  const re = new RegExp(
    /([(])([0-9]|[1-9][0-9]|[1-4][0-9][0-9])([/])([5][0][0])([)])/g,
  );
  const listOfTickets = message.content.replace(/\s/g, '').match(re);
  return listOfTickets;
};

const strikeMessage = async (message) => {
  const tags = isolateTags(message);
  const serverId = message.guild.id
  const roleName = await botDb.findOne({where: {Name: 'Away Role', ServerId: serverId}})
  const tickets = isolateTickets(message);
  const month = new Date().toLocaleString('default', { month: 'long' });
  const day = new Date().getDate();
  let reply = `Strikes for ${day} ${month}: \n\n`;
  let awayReply = `The following Members are excused due to being ${roleName.Value}: \n\n`
  if (day === '1') {
    const numberOfIds = await guildDb.count({where: {ServerId: serverId}});
    const ids = Array.from({ length: numberOfIds }, (_, index) => index + 1);
    for await (i of ids) {
      await guildDb.update({ strikes: 0 }, { where: { id: i } });
    }
    return;
  }

  try {
    for (i in tags) {
      let user = message.mentions.users.first(i + 1)[i]
      if (
        message.mentions.members
          .first(i + 1)
          [i].roles.cache.some((role) => role.name === roleName.Value) === true
      ) {
        awayReply = awayReply + `${user.username}\n`
        continue;
      }
      reply = reply + `${message.mentions.members.first(i + 1)[i]}`;
      for (j in tickets) {
        await assignStrikes(message.mentions.users.first(i + 1)[i], serverId);
        let numberOfStrikes = await getStrikes(user, serverId);
        let strike = ':x:';
        let strikes = strike.repeat(numberOfStrikes);

        reply = reply + ` - ${strikes} - Missed Tickets` + tickets[j] + '\n';
        break;
      }
    }
  } catch (error) {
    console.log('ERROR', error);
  }
  if (awayReply !== `The following Members are excused due to being ${roleName.Value}: \n\n` && reply !== `Strikes for ${day} ${month}: \n\n`) {
    reply = reply + '\n\n' + awayReply
  }
  if (reply === `Strikes for ${day} ${month}: \n\n` && awayReply !== `The following Members are excused due to being ${roleName.Value}: \n\n`) {
    reply = 'No ticket strikes today! Well done everyone!\n\n' + awayReply
  }
  return reply;
};

module.exports = {
  strikeMessage,
};
