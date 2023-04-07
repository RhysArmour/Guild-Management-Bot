const { getStrikes, guildDb, assignStrikes } = require('../utils/database/guild-db');
// const { client } = require('../../index')
const { botDb, getAwayRole } = require('../utils/database/bot-db');
const { currentDate } = require('../utils/helpers/get-date');

const isolateTickets = (message) => {
  console.info('Isolating Tickets');
  const re = /([(])([0-9]|[1-9][0-9]|[1-4][0-9][0-9])([/])([5][0][0])([)])/g;
  const listOfTickets = message.content.replace(/([*])|\s/g, '').match(re);
  return listOfTickets;
};

const ticketStrikes = async (message) => {
  const mentions = message.mentions.members.map((user) => user);
  const serverId = message.guild.id;
  const tickets = Object.values(isolateTickets(message));
  const awayRole = await getAwayRole(serverId);

  let response = '';
  let awayMembers = '';

  try {
    for (let i = 0; i < mentions.length; i++) {
      const member = mentions[i];
      const { user } = member;
      const ticket = tickets.shift();

      if (member.roles.cache.some((role) => role.name === awayRole.Value) === true) {
        awayMembers += `${user.username}\n`;
        continue;
      }

      await assignStrikes(user, serverId);
      const numberOfStrikes = await getStrikes(user, serverId);
      const strike = ':x:';
      const strikes = strike.repeat(numberOfStrikes);

      response += `<@${user.id}> - ${strikes} - Missed Tickets${ticket}\n`;
    }
  } catch (error) {
    console.log(error);
  }
  const result = {
    response,
    awayMembers,
  };

  return result;
};

const ticketStrikeMessage = async (message) => {
  const { day, month } = currentDate();
  const serverId = message.guild.id;
  const { response, awayMembers } = await ticketStrikes(message);
  let reply = `Strikes for ${day} ${month}: \n\n${response}`;
  const awayRole = await getAwayRole(serverId);
  const awayReply = `The following Members are excused due to being ${awayRole.Value}: \n\n${awayMembers}`;

  if (
    awayReply !== `The following Members are excused due to being ${awayRole.Value}: \n\n` &&
    reply !== `Strikes for ${day} ${month}: \n\n`
  ) {
    reply += `\n\n${awayReply}`;
  }
  if (reply === `Strikes for ${day} ${month}: \n\n` && !awayReply.includes(awayMembers)) {
    reply = `No ticket strikes today! Well done everyone!\n\n${awayReply}`;
  }
  return reply;
};

const resetMonthlyStrikes = async (strikeRecord, client) => {
  const { month } = currentDate();
  const { UniqueId, ServerId } = strikeRecord;
  console.info('Resetting Monthly Strikes');
  const strikeChannel = client.channels.cache.find((channel) => channel.id === UniqueId);
  strikeChannel.send('1st of the month, Resetting monthly strikes.');
  await guildDb.update({ Strikes: 0 }, { where: { ServerId } });

  console.info('Updating Strike Reset date');
  await botDb.upsert(
    { Name: 'LastStrikeReset', Value: month, ServerId },
    { where: { ServerId, Name: 'LastStrikeReset' } },
  );
};

module.exports = {
  ticketStrikeMessage,
  resetMonthlyStrikes,
};
