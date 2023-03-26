const {
  getStrikes,
  guildDb,
  assignStrikes,
  checkRoomsAreAssigned,
} = require('../utils/database/guild-db');
// const { client } = require('../../index')
const { botDb, getAwayRole } = require('../utils/database/bot-db');
const { currentDate } = require('../utils/helpers/get-date');

const isolateTickets = (message) => {
  console.info('Isolating Tickets');
  const re = new RegExp(
    /([(])([0-9]|[1-9][0-9]|[1-4][0-9][0-9])([/])([5][0][0])([)])/g,
  );
  const listOfTickets = message.content.replace(/([*])|\s/g, '').match(re)
  return listOfTickets;
};

const ticketStrikeMessage = async (message) => {
  const { day, month } = currentDate();
  const serverId = message.guild.id;
  const { response, awayMembers } = await ticketStrikes(message);
  let reply = `Strikes for ${day} ${month}: \n\n ${response}`;
  const awayRole = await getAwayRole(serverId);
  let awayReply = `The following Members are excused due to being ${awayRole.Value}: \n\n${awayMembers}`;

  if (
    awayReply !==
      `The following Members are excused due to being ${awayRole.Value}: \n\n` &&
    reply !== `Strikes for ${day} ${month}: \n\n`
  ) {
    reply = reply + '\n\n' + awayReply;
  }
  if (
    reply === `Strikes for ${day} ${month}: \n\n` &&
    !awayReply.includes(awayMembers)
  ) {
    reply = 'No ticket strikes today! Well done everyone!\n\n' + awayReply;
  }
  return reply;
};

const ticketStrikes = async (message) => {
  const mentions = message.mentions.members.map((user) => user);
  const serverId = message.guild.id;
  const tickets = isolateTickets(message);
  const awayRole = await getAwayRole(serverId);
  const { day } = currentDate();

  let response = '';
  let awayMembers = '';

  try {
    for (i in mentions) {
      let member = mentions[i];
      let user = member.user;

      if (
        member.roles.cache.some((role) => role.name === awayRole.Value) === true
      ) {
        awayMembers = awayMembers + `${user.username}\n`;
        continue;
      }
      response = response + `<@${user.id}>`;
      for (j in tickets) {
        await assignStrikes(user, serverId);
        let numberOfStrikes = await getStrikes(user, serverId);
        let strike = ':x:';
        let strikes = strike.repeat(numberOfStrikes);

        response =
          response + ` - ${strikes} - Missed Tickets` + tickets[j] + '\n';
        break;
      }
    }
  } catch (error) {
    console.log(error);
  }

  result = {
    response,
    awayMembers,
  };

  return result;
};

const resetMonthlyStrikes = async (strikeRecord, client) => {
    const { month } = currentDate()
    const { UniqueId, ServerId } = strikeRecord
    console.info('Resetting Monthly Strikes');
    const channel = client.channels.cache.find(channel => channel.id === UniqueId)
    channel.send('1st of the month, Resetting monthly strikes.');
    await guildDb.update({ Strikes: 0 }, { where: { ServerId: ServerId } });

    console.info('Updating Strike Reset date')
    await botDb.upsert({Name: 'LastStrikeReset', Value: month, ServerId: ServerId}, {where: {ServerId: ServerId, Name: 'LastStrikeReset'}})
};

module.exports = {
  ticketStrikeMessage,
  resetMonthlyStrikes,
};
