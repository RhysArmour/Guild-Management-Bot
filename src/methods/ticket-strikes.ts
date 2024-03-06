import { MemberTableServices } from '../database/services/member-services';
import { Logger } from '../logger';
import { APIEmbed, Guild } from 'discord.js';
import { choices } from '../utils/helpers/commandVariables';
import { StrikeReasonsServices } from '../database/services/strike-reason-services';
import { ServerWithRelations } from '../interfaces/database/server-table-interface';
import { currentDate } from '../utils/helpers/get-date';

interface TicketStrikes {
  response: string;
  awayMembers: string;
  unregisteredMembers: string;
}

interface Offenders {
  playerName: string;
  playerId: string;
  tickets: number;
  lifetimeTickets: number;
}

export const addTicketStrikes = async (offenders: Offenders[], server: ServerWithRelations, discordGuild: Guild) => {
  const { absenceRoleId } = server.roles;

  let response = '';
  let awayMembers = '';
  let unregisteredMembers = '';

  try {
    if (offenders) {
      let strikeValue = 1;
      Logger.info('Getting ticket Strike Value');
      const ticketStrikeRecord = server.guildStrikes.find((strike) => strike.strikeReason === choices[0].name);

      if (ticketStrikeRecord) {
        strikeValue = ticketStrikeRecord.value;
      }

      Logger.info(`Ticket Strike Value: ${strikeValue}`);

      for (const entry of offenders) {
        const member = server.members.find((member) => member.playerId === entry.playerId);
        if (!member) {
          unregisteredMembers += `${entry.playerName}\n`;
          continue;
        }
        const discordMember = await discordGuild.members.fetch(member.memberId);

        if (discordMember.roles.cache.some((role) => role.id === absenceRoleId)) {
          awayMembers += `${discordMember.displayName}\n`;
          continue;
        }

        await MemberTableServices.addMemberStrikesWithMember(discordMember, strikeValue);
        await StrikeReasonsServices.createStrikeReasonByMember(discordMember, `Ticket Strike ${entry.tickets}`);
        const { strikes } = await MemberTableServices.getAllStrikeReasonsByMember(discordMember);
        const strike = ':x:';
        response += `<@${discordMember.id}> - ${strike.repeat(strikes)} - Missed Tickets: ${entry.tickets}/600\n`;
      }
    }
  } catch (error) {
    Logger.error(`Error in ticketStrikes: ${error}`);
  }

  if (response.length < 1) {
    response = 'No ticket strikes today. Well done everyone!';
  }

  const result = {
    response,
    awayMembers,
    unregisteredMembers,
  };

  return result;
};

export const ticketStrikeMessage = async (
  ticketStrikes: TicketStrikes,
  server: ServerWithRelations,
): Promise<APIEmbed> => {
  const { currentDay, currentMonth } = currentDate('long');
  const { response, awayMembers, unregisteredMembers } = ticketStrikes;
  const title = `Ticket Strikes for ${currentDay} ${currentMonth}:`;
  const { absenceRoleName } = server.roles;
  let strikeReply = 'No ticket strikes today! Well done everyone!';
  let excusedReply = `No one ${absenceRoleName} missed tickets!`;
  let unregisteredMembersReply = ``;

  if (response) {
    strikeReply = response;
  }

  if (awayMembers) {
    excusedReply = awayMembers;
  }

  if (unregisteredMembers) {
    unregisteredMembersReply = unregisteredMembers;
  }

  let reply = {
    title,
    fields: [
      { name: 'Strikes', value: strikeReply },
      { name: 'Excused', value: excusedReply },
      { name: 'Unregistered', value: unregisteredMembersReply },
    ],
  };

  if (!unregisteredMembersReply) {
    reply = {
      title,
      fields: [
        { name: 'Strikes', value: strikeReply },
        { name: 'Excused', value: excusedReply },
      ],
    };
  }

  return reply;
};

// COMPLETED TESTING FOR AUTO TICKET STRIKES (FOR NOW). RUN TESTING FOR PRE-REGISTERED SERVERS & MEMBERS, WILL REQUIRE DB MANIPULATION.
