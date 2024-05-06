import ExtendedClient from './classes/ClientClass';
import { Logger } from './logger';
import { Cron } from 'croner';
import config from './config';
import { ServerTableService } from './database/services/server-services';
import { MemberTableServices } from './database/services/member-services';
import { addTicketStrikes, ticketStrikeMessage } from './methods/ticket-strikes';
import { resetMonthlyStrikes } from './methods/reset-monthly-strikes';

export const client = new ExtendedClient();

client.start();

client.on('ready', async () => {
  Logger.info('Bot is Ready');
  Logger.info('Setting up Cron Schedule.');
  Cron('30 29 * * * *', async () => {
    Logger.info('Running Ticket Checks');
    const date = new Date();

    Logger.info('Checking for guilds with reset times.');
    const existingGuildsWithResetTime = await ServerTableService.getGuildResetTimes();

    if (existingGuildsWithResetTime?.length) {
      Logger.info(`${existingGuildsWithResetTime.length} guilds found for ticket run.`);
      for (const server of existingGuildsWithResetTime) {
        if (
          date.getDate() === 1 &&
          (!server.lastStrikeReset || date.getMonth() - server.lastStrikeReset.getMonth() <= 1)
        ) {
          Logger.info('1st of the month and last strike reset took place last month. Starting resetMonthlyStrikes');
          await resetMonthlyStrikes(server);
        }

        if (server.ticketStrikesActive === true) {
          Logger.info('Ticket strikes active. Starting to issue strikes.');
          const discordGuild = await client.guilds.fetch(server.serverId);
          const strikeChannelId = server.channels.strikeChannelId;
          const offenders = await MemberTableServices.getMembersWithLessThanTicketLimit(server);
          const ticketStrikes = await addTicketStrikes(offenders, server, discordGuild);
          await ServerTableService.updateServerTableGuildResetTime(server);
          const strikeChannel = await discordGuild.channels.fetch(strikeChannelId);
          const formattedResponse = await ticketStrikeMessage(ticketStrikes, server);
          if (strikeChannel.isTextBased()) {
            strikeChannel.send({ embeds: [formattedResponse] });
          }
        }
      }
    } else {
      Logger.info('No guilds with a reset time at the current time');
    }
  });
});

client.login(config.token);
