import { PrismaClient } from '@prisma/client';
import { getStrikes } from '../utils/database/services/member-services';
import { assignStrikes } from '../utils/database/services/member-services';
import { getAwayRole } from '../utils/database/services/role-services';
import { Logger } from '../logger';

const prisma = new PrismaClient();

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
      const {strikes} = await getStrikes(user, serverId);
      const strike = ':x:';

      response += `<@${user.id}> - ${strike.repeat(strikes)} - Missed Tickets${ticket}\n`;
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
  const date = new Date();
  const day = date.getDay();
  const month = date.toLocaleString('default', { month: 'long' });
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
  const date = new Date();
  const day = date.getDay();
  const month = date.toLocaleString('default', { month: 'long' });
  const { uniqueUserId, serverId } = strikeRecord;
  Logger.info('Resetting Monthly Strikes');
  const strikeChannel = client.channels.cache.find((channel) => channel.id === uniqueUserId);
  strikeChannel.send('1st of the month, Resetting monthly strikes.');
  await prisma.members.updateMany({ where: { serverId: serverId }, data: { strikes: 0 } });

  Logger.info('Updating Strike Reset date');
  await prisma.strikes.updateMany({
    where: { serverId: serverId },
    data: { lastStrikeReset: Date.now().toString() },
  });
};

export { ticketStrikeMessage, resetMonthlyStrikes };
