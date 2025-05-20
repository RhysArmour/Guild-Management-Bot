import { Logger } from '../logger';
import { APIEmbed, Guild, GuildMember } from 'discord.js';
import { currentDate } from '../utils/helpers/get-date';
import { Comlink } from '../classes/Comlink';
import { Account, Roles, Server, Strikes } from '../../db/models';
import { StrikeRepository } from '../database/repositories/strikes-repository';
import { AccountRepository } from '../database/repositories/account-repository';
import { MemberRepository } from '../database/repositories/member-repository';
import { generateStrikeDetailsEmbed } from '../utils/helpers/util-functions';

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

/**
 * Add ticket strikes to offenders.
 */
export const addTicketStrikes = async (
  offenders: Offenders[],
  server: Server,
  discordGuild: Guild,
): Promise<TicketStrikes> => {
  const { absenceRoleId } = server.roles;

  let response = '';
  let awayMembers = '';
  let unregisteredMembers = '';

  try {
    if (offenders) {
      for (const entry of offenders) {
        const account = server.members
          .map((member) => member.accounts.find((account) => account.playerId === entry.playerId))
          .find((account) => account !== undefined);

        if (!account) {
          unregisteredMembers = handleUnregisteredMember(entry, unregisteredMembers);
          continue;
        }

        const accountRecord = await new AccountRepository().findByAllyCode(account.allyCode);
        const discordMember = await discordGuild.members.fetch(accountRecord.discordId);

        if (discordMember.roles.cache.some((role) => role.id === absenceRoleId)) {
          awayMembers = handleExcusedMember(discordMember, awayMembers);
          continue;
        }

        response = await handleStrikeCreation(accountRecord, entry, response, discordMember);
      }
    }
  } catch (error) {
    Logger.error(`Error in addTicketStrikes: ${error}`);
  }

  if (!response) {
    response = '✅ No ticket strikes today! Well done everyone!';
  }

  return { response, awayMembers, unregisteredMembers };
};

/**
 * Build the ticket strike message embed.
 */
export const ticketStrikeMessage = async (ticketStrikes: TicketStrikes): Promise<APIEmbed> => {
  const { currentDay, currentMonth } = currentDate('long');
  const { response, awayMembers, unregisteredMembers } = ticketStrikes;
  const title = `🎟️ Ticket Strikes for ${currentDay} ${currentMonth}`;

  // Default replies
  const strikeReply = response || '✅ No ticket strikes today! Well done everyone!';
  const excusedReply = awayMembers || '✅ No one absent missed tickets!';
  const unregisteredMembersReply = unregisteredMembers || '✅ No unregistered members missed tickets!';

  // Determine embed color based on the conditions
  let color = 0x00ff00; // Default to green (no ticket strikes, no unregistered members)
  if (response && response !== '✅ No ticket strikes today! Well done everyone!') {
    color = 0xff0000; // Red if there are ticket strikes
  } else if (unregisteredMembers && unregisteredMembers !== '✅ No unregistered members missed tickets!') {
    color = 0xffff00; // Yellow if there are unregistered members but no ticket strikes
  }

  // Build the embed fields
  const fields = [
    { name: '❌ Strikes', value: strikeReply, inline: false },
    { name: '✈️ Excused', value: excusedReply, inline: false },
  ];

  // Add unregistered members field only if there are unregistered members
  if (unregisteredMembers) {
    fields.push({ name: '⚠️ Unregistered Members', value: unregisteredMembersReply, inline: false });
  }

  // Return the embed
  return {
    title,
    description: `Here is the summary of today's ticket strikes.`,
    color, // Dynamically set the color
    fields,
    footer: {
      text: 'Ticket Strike System',
      icon_url: 'https://example.com/ticket-icon.png', // Replace with an actual icon URL if available
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Find members with tickets below the server's ticket limit.
 */
export const findMembersWithLessThanTicketLimit = async (server: Server) => {
  const memberTickets = await Comlink.getGuildTickets(server.guild.guildId);
  return memberTickets.filter((member) => member.tickets < server.ticketLimit);
};

/**
 * Helper function to handle unregistered members.
 */
const handleUnregisteredMember = (entry: Offenders, unregisteredMembers: string): string => {
  Logger.info(`Unregistered member found: ${entry.playerName}`);
  return `${unregisteredMembers}${entry.playerName}\n`;
};

/**
 * Helper function to handle excused members.
 */
const handleExcusedMember = (discordMember: GuildMember, awayMembers: string): string => {
  Logger.info(`Excused member found: ${discordMember.displayName}`);
  return `${awayMembers}${discordMember.displayName}\n`;
};

/**
 * Helper function to create a strike and build the response.
 */
const handleStrikeCreation = async (
  account: Account,
  entry: Offenders,
  response: string,
  discordMember: GuildMember,
): Promise<string> => {
  const strikeRepo = new StrikeRepository();
  const accountRepo = new AccountRepository();

  await strikeRepo.createStrike(account, 'TicketStrike');

  const memberRecord = await new MemberRepository().findById(account.memberId, {
    include: [
      { model: Account, as: 'accounts', include: [{ model: Strikes, as: 'strikes' }] },
      { model: Server, as: 'server', include: [{ model: Roles, as: 'roles' }] },
    ],
  });

  const sortedAccounts = memberRecord.accounts.sort((a, b) => {
    if (a.alt === b.alt) {
      return a.displayName.localeCompare(b.displayName); // Secondary sort by displayName
    }
    return a.alt ? 1 : -1; // If `alt` is true, it goes after `alt: false`
  });
  Logger.info({ sortedAccounts: sortedAccounts.map((a) => a.displayName) }, 'Sorted accounts for embed');

  // Generate the embed
  const embed = generateStrikeDetailsEmbed(
    memberRecord.server,
    null,
    discordMember,
    memberRecord,
    sortedAccounts,
    memberRecord.activeStrikeCount,
    `:x: Strike Added To ${memberRecord.displayName} - TicketStrike`,
    `Here is a detailed breakdown of ${memberRecord.displayName}'s active strikes.`,
  );

  // Send the embed to the strike channel
  Logger.info(`Sending strike details to ${discordMember.displayName}`);
  await discordMember.send({ embeds: [embed] }).catch((error) => {
    Logger.error(`Failed to send DM to ${discordMember.displayName}: ${error}`);
  });

  if (memberRecord.activeStrikeCount >= memberRecord.server.strikeLimit) {
    discordMember?.roles.add(memberRecord.server.roles.strikeLimitRoleId);
  }

  const updatedAccount = await accountRepo.findByAllyCode(account.allyCode);

  const strike = ':x:';
  const strikeIcons = strike.repeat(updatedAccount.activeStrikeCount);

  Logger.info(`Strike created for account: ${account.displayName}`);
  return `${response}🛡️ Account: ${account.displayName} (${account.allyCode}) - Missed Tickets: ${entry.tickets}/600 - ${strikeIcons}\n`;
};
