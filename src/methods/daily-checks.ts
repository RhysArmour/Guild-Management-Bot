import { Guild } from '../../db/models/guild';
import { Guild as DiscordGuild } from 'discord.js';
import { Server } from '../../db/models';
import { client } from '../bot';
import { GuildRepository } from '../database/repositories/guild-repository';
import { ServerRepository } from '../database/repositories/server-repository';
import { Logger } from '../logger';
import { monthlyStrikeSummary, removeExpiredStrikes } from './strike-resets';
import { findMembersWithLessThanTicketLimit, addTicketStrikes, ticketStrikeMessage } from './ticket-strikes';
import { sendMessage } from '../utils/helpers/messages';

// Run daily checks for guild data sync
export const runDailyChecks = async () => {
  Logger.info('Running Daily Checks');
  const guilds = await new GuildRepository().findAllGuilds();

  if (guilds?.length) {
    Logger.info(`Running daily checks for ${guilds.length} guilds.`);
    for (const guild of guilds) {
      Logger.info(`Running daily checks for guild: ${guild.guildId}`);

      const updatedGuild = await new GuildRepository().updateGuildData(guild);

      if (!updatedGuild) {
        Logger.error(`Failed to update guild data for guild: ${guild.guildId}`);
        continue;
      }

      Logger.info(`Guild ${updatedGuild.guildName} data updated successfully.`);
    }
  }
};

// Run hourly checks for guild ticket compliance and manage strikes
export const runHourlyChecks = async () => {
  Logger.info('Running Ticket Checks');
  Logger.info('Checking for guilds with reset times.');
  const existingGuildsWithResetTime = await new GuildRepository().findGuildResetTimes();
  const date = new Date();

  if (existingGuildsWithResetTime?.length) {
    Logger.info(`${existingGuildsWithResetTime.length} guilds found with resetTime ${date.getTime()}.`);
    for (const guild of existingGuildsWithResetTime) {
      Logger.info(`Running daily checks for guild ${guild.guildId}`);
      if (date.getDate() === 1) {
        Logger.info('Sending monthly strike summary.');
        const monthlySummary = await monthlyStrikeSummary(guild.server);
        await sendMessage(client, {
          channelId: guild.server.channels.strikeChannelId,
          content: monthlySummary,
        });
      }
      Logger.info('Handling expired strikes.');
      const expiredStrikeSummary = await removeExpiredStrikes(guild.server);
      
      await sendMessage(client, {
        channelId: guild.server.channels.strikeChannelId,
        content: expiredStrikeSummary,
      });
    }
    Logger.info('Handling ticket run.');
    await Promise.all(existingGuildsWithResetTime.map(handleGuildTicketRun()));
  } else {
    Logger.info('No guilds with a reset time at the current time');
  }
};

// Handle ticket run for a specific guild
const handleGuildTicketRun = () => async (guild: Guild) => {
  try {
    const server: Server | null = await new ServerRepository().findServer(guild.serverId);
    if (!server) {
      Logger.error(`Server not found for guild ${guild.guildId}`);
      return;
    }

    const discordGuild = await client.guilds.fetch(server.serverId);
    const strikeChannelId = server.channels?.strikeChannelId;
    if (!strikeChannelId) {
      Logger.error(`Strike channel not found for server ${server.serverId}`);
      return;
    }

    if (server.ticketStrikesActive === true) {
      const ticketStrikes = await assignTicketStrikes(server, discordGuild);
      const formattedResponse = await ticketStrikeMessage(ticketStrikes);
      await sendMessage(client, {
        channelId: strikeChannelId,
        content: formattedResponse,
      });
    }
  } catch (error) {
    Logger.error(`Error handling ticket run for guild ${guild.guildId}: ${error}`);
  }
};

// Assign ticket strikes to offenders
const assignTicketStrikes = async (server: Server, discordGuild: DiscordGuild) => {
  Logger.info('Ticket strikes active. Starting to issue strikes.');
  const offenders = await findMembersWithLessThanTicketLimit(server);
  const ticketStrikes = await addTicketStrikes(offenders, server, discordGuild);
  await new GuildRepository().updateResetTime(server.guild);
  return ticketStrikes;
};
