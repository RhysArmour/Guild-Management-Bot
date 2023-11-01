import ExtendedClient from './classes/ClientClass';
import { Logger } from './logger';
import config from './config';
import { ChannelTableService } from './database/services/channel-services';
import { ServerTableService } from './database/services/server-services';
import { MemberTableServices } from './database/services/member-services';
import { StrikeReasonsServices } from './database/services/strike-reason-services';
import { TextChannel } from 'discord.js';
import { ticketStrikeMessage } from './methods/ticket-strikes';

export const client = new ExtendedClient();

client.start();

client.on('ready', async () => {
  Logger.info('Bot is Ready');
});

client.on('messageCreate', async (message) => {
  Logger.info('Processing Message');
  try {
    if (message.author?.id === process.env.ticketIssuerId) {
      Logger.info('Message is from Hotbot');
      const serverId = message.guild?.id;
      const { ticketChannelId, strikeChannelId } = await ChannelTableService.getChannelsByServerId(message.guild.id);
      const { triggerPhrase, lastStrikeReset } = await ServerTableService.getServerTableByServerId(message.guild.id);

      if (!triggerPhrase || !ticketChannelId) {
        Logger.warn('Bot has not been setup.');
        return;
      }

      if (message.content.includes(`${triggerPhrase}`)) {
        const date = new Date();
        const day = date.getDate();

        const month = date.getMonth();

        // Check if it's the first day of the month and last strike reset was not done in the current month
        if (day === 1 && (!lastStrikeReset || month - lastStrikeReset.getMonth() === 1 || month === 0)) {
          Logger.info('Day equals 1 and last strike reset took place last month. Starting resetMonthlyStrikes');
          await MemberTableServices.updateAllStrikesWithServerId(serverId);
          await ServerTableService.updateLastStrikeResetEntryByServerId(serverId);
          await StrikeReasonsServices.deleteManyStrikeReasonEntriesByServerId(serverId);
        }

        try {
          const strikeChannelObj = message.guild.channels.cache.get(strikeChannelId);
          const ticketChannelObj = message.guild.channels.cache.get(ticketChannelId);

          // Ensure ticketChannelOb and strikeChannelObj are both text channels
          if (!((ticketChannelObj): ticketChannelObj is TextChannel => ticketChannelObj.type === 0)(ticketChannelObj))
            return;
          if (!((strikeChannelObj): strikeChannelObj is TextChannel => strikeChannelObj.type === 0)(strikeChannelObj))
            return;

          const replyMessage = await ticketStrikeMessage(message);
          strikeChannelObj?.send(replyMessage);
        } catch (error) {
          Logger.error(error);
        }
      }
    } else {
      return;
    }
  } catch (error) {
    Logger.error('An error occurred while processing the message:', error);
  }
});

client.login(config.token);
