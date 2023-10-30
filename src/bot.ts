// import { TextChannel } from 'discord.js';
import ExtendedClient from './classes/ClientClass';
import { Logger } from './logger';
import config from './config';
// import { PrismaClient } from '@prisma/client';
// import { ticketStrikeMessage } from './services/ticket-strikes';
// import { getStrikeRecord, resetMonthlyStrikes } from './database/services/limits-services';

export const client = new ExtendedClient();
// const prisma = new PrismaClient();

client.start();

client.on('ready', async () => {
  Logger.info('Bot is Ready');
});

// client.on('messageCreate', async (message) => {
//   Logger.info('Processing Message');
//   try {
//     if (message.author?.id === process.env.ticketIssuerId) {
//       Logger.info('Message is from Hotbot');
//       const serverId = message.guild?.id;
//       const { triggerPhrase, ticketChannelId } = await prisma.guildTicketsTable.findUnique({
//         where: { serverId: serverId },
//       });

//       if (!triggerPhrase || !ticketChannelId) {
//         Logger.warn('Bot has not been setup.');
//         return;
//       }

//       if (message.content.includes(`${triggerPhrase}`)) {
//         Logger.info('Getting Strike Record.');
//         const strikeRecord = await getStrikeRecord(serverId);
//         Logger.info('Strike Record retrieved successfully.');
//         const { lastStrikeReset, strikeChannelId } = strikeRecord;

//         const date = new Date();
//         const day = date.getDay();
//         const month = date.getMonth();

//         // Check if it's the first day of the month and last strike reset was not done in the current month
//         if (day === 1 && (!lastStrikeReset || month - lastStrikeReset.getMonth() === 1 || month === 1)) {
//           Logger.info('Day equals 1 and last strike reset took place last month. Starting resetMonthlyStrikes');
//           await resetMonthlyStrikes(strikeRecord, client);
//         }

//         try {
//           const strikeChannelObj = message.guild.channels.cache.get(strikeChannelId);
//           const ticketChannelObj = message.guild.channels.cache.get(ticketChannelId);

//           // Ensure ticketChannelOb and strikeChannelObj are both text channels
//           if (!((ticketChannelObj): ticketChannelObj is TextChannel => ticketChannelObj.type === 0)(ticketChannelObj))
//             return;
//           if (!((strikeChannelObj): strikeChannelObj is TextChannel => strikeChannelObj.type === 0)(strikeChannelObj))
//             return;

//           const replyMessage = await ticketStrikeMessage(message);
//           strikeChannelObj?.send(replyMessage);
//         } catch (error) {
//           Logger.error(error);
//         }
//       }
//     } else {
//       return;
//     }
//   } catch (error) {
//     Logger.error('An error occurred while processing the message:', error);
//   }
// });

client.login(config.token);
