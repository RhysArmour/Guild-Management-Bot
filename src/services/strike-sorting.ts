import { getStrikes, GuildUserTable, assignStrikes } from '../utils/database/models/guild-db';
import { GuildBotData, getAwayRole } from '../utils/database/models/bot-db';
import { currentDate } from '../utils/helpers/get-date';
import { Logger } from '../logger';

const isolateTickets = (message) => {
  Logger.info('Isolating Tickets');
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

      if (member.roles.cache.some((role) => role.name === awayRole) === true) {
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
    Logger.error(error);
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
  const awayReply = `The following Members are excused due to being ${awayRole}: \n\n${awayMembers}`;

  if (
    awayReply !== `The following Members are excused due to being ${awayRole}: \n\n` &&
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
  Logger.info('Resetting Monthly Strikes');
  const strikeChannel = client.channels.cache.find((channel) => channel.id === UniqueId);
  strikeChannel.send('1st of the month, Resetting monthly strikes.');
  await GuildUserTable.update({ strikes: 0 }, { where: { ServerId } });

  Logger.info('Updating Strike Reset date');
  await GuildBotData.update({ lastStrikeReset: Date.now(), ServerId: ServerId }, { where: { ServerId: ServerId } });
};

export { ticketStrikeMessage, resetMonthlyStrikes };
