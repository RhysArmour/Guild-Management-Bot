const {
  getStrikes,
  guildDb,
  assignStrikes,
  checkRoomsAreAssigned,
} = require('../utils/database/guild-db');
const { botDb } = require('../utils/database/bot-db');

const isolateTags = (message) => {
  console.info('Isolating Tags');
  let listOfOffenders = message.mentions.users.map((user) => user.name);
  for (i in listOfOffenders) {
    listOfOffenders[i] = '<@' + listOfOffenders + '>';
  }
  return listOfOffenders;
};

const isolateTickets = (message) => {
  console.info('Isolating Tickets');
  const re = new RegExp(
    /([(])([0-9]|[1-9][0-9]|[1-4][0-9][0-9])([/])([5][0][0])([)])/g,
  );
  const listOfTickets = message.content.replace(/\s/g, '').match(re);
  return listOfTickets;
};

const strikeMessage = async (message) => {
  const tags = isolateTags(message);
  const serverId = message.guild.id;
  const roleName = await botDb.findOne({
    where: { Name: 'Away Role', ServerId: serverId },
  });
  const tickets = isolateTickets(message);
  const month = new Date().toLocaleString('default', { month: 'long' });
  const day = new Date().getDate();
  const roomsAssigned = await checkRoomsAreAssigned(serverId);
  let reply = `Strikes for ${day} ${month}: \n\n`;
  let awayReply = `The following Members are excused due to being ${roleName.Value}: \n\n`;

  if (day === '1') {
    console.info('Resetting Monthly Strikes');
    message.reply('1st of the month, Resetting monthly strikes.');
    const numberOfIds = await guildDb.count({ where: { ServerId: serverId } });
    const ids = Array.from({ length: numberOfIds }, (_, index) => index + 1);
    for await (i of ids) {
      await guildDb.update({ strikes: 0 }, { where: { id: i } });
    }
  }

  try {
    if (typeof roomsAssigned === 'string') {
      return roomsAssigned;
    }

    console.log('TAGS', tags);
    
    for (i in tags) {
      console.log('=== I ===', i)
      let user = message.mentions.users.first(i + 1)[i];
      if (
        message.mentions.members
          .first(i + 1)
          [i].roles.cache.some((role) => role.name === roleName.Value) === true
      ) {
        awayReply = awayReply + `${user.username}\n`;
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
  if (
    awayReply !==
      `The following Members are excused due to being ${roleName.Value}: \n\n` &&
    reply !== `Strikes for ${day} ${month}: \n\n`
  ) {
    reply = reply + '\n\n' + awayReply;
  }
  if (
    reply === `Strikes for ${day} ${month}: \n\n` &&
    awayReply !==
      `The following Members are excused due to being ${roleName.Value}: \n\n`
  ) {
    reply = 'No ticket strikes today! Well done everyone!\n\n' + awayReply;
  }
  return reply;
};

module.exports = {
  strikeMessage,
};
