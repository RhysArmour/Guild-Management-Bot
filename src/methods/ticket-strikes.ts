import { MemberTableServices } from '../database/services/member-services';
import { RoleTableService } from '../database/services/role-services';
import { StrikeValuesTableService } from '../database/services/strike-values-services';
import { Logger } from '../logger';
import { Message } from 'discord.js';
import { choices } from '../utils/commandVariables';
import { StrikeReasonsServices } from '../database/services/strike-reason-services';

const isolateTickets = (message: Message) => {
  Logger.info('Isolating Tickets');
  const re = /([(])([0-9]|[1-9][0-9]|[1-4][0-9][0-9])([/])([5][0][0])([)])/g;
  const listOfTickets = message.content.replace(/([*])|\s/g, '').match(re);
  return listOfTickets;
};

const ticketStrikes = async (message: Message) => {
  const mentions = message.mentions.members.map((member) => member);
  const serverId = message.guild.id;
  const tickets = Object.values(isolateTickets(message));
  Logger.info('Retrieving Absent Role');
  const { absenceRoleId } = await RoleTableService.getRolesByServerId(serverId);
  Logger.info('Absent Role retrieved successfully ');

  let response = '';
  let awayMembers = '';

  try {
    let strikeValue = 1;
    const ticketStrikeValue = await StrikeValuesTableService.getIndividualStrikeValueByServerId(
      serverId,
      choices[0].name,
    );

    if (ticketStrikeValue) {
      strikeValue = ticketStrikeValue;
    }

    for (let i = 0; i < mentions.length; i++) {
      const member = mentions[i];
      const ticket = tickets.shift();

      if (member.roles.cache.some((role) => role.id === absenceRoleId)) {
        awayMembers += `${member.displayName}\n`;
        continue;
      }

      await MemberTableServices.addMemberStrikesWithMember(member, strikeValue);
      await StrikeReasonsServices.createStrikeReasonByMember(member, `Ticket Strike ${ticket}`);
      const { strikes } = await MemberTableServices.getAllStrikeReasonsByMember(member);
      const strike = ':x:';

      response += `<@${member.id}> - ${strike.repeat(strikes)} - Missed Tickets${ticket}\n`;
    }
  } catch (error) {
    Logger.error(`Error in ticketStrikes: ${error}`);
  }

  if (response.length < 1) {
    response = 'No ticket strikes today. Well done everyone!';
  }

  Logger.info('response:', response);

  const result = {
    response,
    awayMembers,
  };

  return result;
};

export const ticketStrikeMessage = async (message: Message) => {
  const date = new Date();
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const serverId = message.guild.id;
  const { response, awayMembers } = await ticketStrikes(message);
  let reply = `Strikes for ${day} ${month}: \n\n${response}`;
  const { absenceRoleName } = await RoleTableService.getRolesByServerId(serverId);
  const awayReply = `The following Members are excused due to being ${absenceRoleName}: \n\n${awayMembers}`;

  if (
    awayReply !== `The following Members are excused due to being ${absenceRoleName}: \n\n` &&
    reply !== `Strikes for ${day} ${month}: \n\n`
  ) {
    reply += `\n\n${awayReply}`;
  }

  if (reply === `Strikes for ${day} ${month}: \n\n` && !awayReply.includes(awayMembers)) {
    reply = `No ticket strikes today! Well done everyone!\n\n${awayReply}`;
  }

  return reply;
};
