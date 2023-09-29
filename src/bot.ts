import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Interaction,
  TextChannel,
} from 'discord.js';
import ExtendedClient from './classes/ClientClass';
import { Logger } from './logger';
import config from './config';
import { PrismaClient } from '@prisma/client';
import { resetMonthlyStrikes, ticketStrikeMessage } from './services/strike-sorting';
import { addThreeStrikeRole } from './services/three-strike-role';

export const client = new ExtendedClient();
const prisma = new PrismaClient();

client.start();

client.on('messageCreate', async (message) => {
  return;
  //   try {
  //     // Retrieve server ID
  //     const serverId = message.guild?.id;
  //     Logger.info(`${message.author?.username} sent a message in ${message.guild?.name}`);

  //     // Fetch necessary guild data from the database
  //     const guildBotData = await prisma.guildBotData.findFirst({
  //       where: { serverId: serverId },
  //     });

  //     if (guildBotData) {
  //       const { triggerPhrase, ticketChannelId, lastStrikeReset, strikeChannelId } = guildBotData;
  //       // Check if the message is from the authorized bot
  //       if (message.author?.id === process.env.ticketIssuerId) {
  //         Logger.info('Message is from Hotbot');

  //         const date = new Date();
  //         const day = date.getDay();
  //         const month = date.toLocaleString('default', { month: 'long' });

  //         // Check if it's the first day of the month and last strike reset was not done in the current month
  //         if (day === 1 && (!lastStrikeReset || lastStrikeReset !== month)) {
  //           Logger.info('Day equals 1 and last strike reset took place last month. Starting resetMonthlyStrikes');
  //           await resetMonthlyStrikes(strikeChannelId, client);
  //         }

  //         // Check if the message contains the trigger phrase and is in the ticket channel
  //         if (message.content.includes(triggerPhrase) && message.channelId.toString() === ticketChannelId.toString()) {
  //           try {
  //             const strikeChannelObj = message.guild.channels.cache.get(strikeChannelId);
  //             Logger.info(strikeChannelObj);
  //             const offenseChannelObj = message.guild.channels.cache.get(ticketChannelId);

  //             // Ensure offenseChannelObj and strikeChannelObj are both text channels
  //             if (
  //               !((offenseChannelObj): offenseChannelObj is TextChannel => offenseChannelObj.type === 0)(
  //                 offenseChannelObj,
  //               )
  //             )
  //               return;
  //             if (!((strikeChannelObj): strikeChannelObj is TextChannel => strikeChannelObj.type === 0)(strikeChannelObj))
  //               return;

  //             offenseChannelObj?.send('Processing Strikes, Please wait');
  //             const replyMessage = await ticketStrikeMessage(message);
  //             strikeChannelObj?.send(replyMessage);
  //           } catch (error) {
  //             Logger.error(error);
  //           }
  //         }
  //       }

  //       // Check if the message is in the strike channel
  //       if (message.channelId.toString() === strikeChannelId?.toString()) {
  //         const strikeLimit = ':x::x::x:';
  //         if (message.content.includes(strikeLimit)) {
  //           addThreeStrikeRole(message);
  //         }
  //       }
  //     } else {
  //       // Handle the case when no data is found
  //       Logger.warn('No guild data found for the server, Cannot check for ticket message');
  //       return;
  //     }
  //   } catch (error) {
  //     Logger.error('An error occurred while processing the message:', error);
  //   }
});

client.login(config.token);
