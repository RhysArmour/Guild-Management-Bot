import { ChatInputCommandInteraction, Client, Collection, Events, GatewayIntentBits, Interaction } from 'discord.js';
import ExtendedClient from './classes/ClientClass';
import { Logger } from './logger';
import config from './config';

export const client = new ExtendedClient()

client.start()


// // client.on('messageCreate', async (message) => {
// //   const serverId = message.guild?.id;
// //   Logger.info(`${message.author?.username} sent a message in ${message.guild?.name}`);

// //   const { triggerPhrase, ticketChannelId, lastStrikeReset, strikeChannelId } = await GuildBotData.findOne({
// //     where: { ServerId: serverId },
// //   });

// //   if (message.author?.id === ticketIssuerId) {
// //     Logger.info('Message is from Hotbot');

// //     const { day, month } = currentDate();

// //     if (day === 1 && (!lastStrikeReset || lastStrikeReset !== month)) {
// //       Logger.info('Day Equals 1 and Last Strike Reset took place last Month. Starting resetMonthly Strikes');
// //       await resetMonthlyStrikes(strikeChannelId, client);
// //     }

// //     if (
// //       message.content.includes(triggerPhrase) &&
// //       message.channelId.toString() === ticketChannelId.toString()
// //     ) {
// //       try {
// //         const strikeChannelObj = message.guild.channels.cache.get(strikeChannelId)
// //         Logger.info(strikeChannelObj)
// //         const offenseChannelObj = message.guild.channels.cache.get(ticketChannelId)

// //         if (!((offenseChannelObj): offenseChannelObj is TextChannel => offenseChannelObj.type === 0)(offenseChannelObj)) return;
// //         if (!((strikeChannelObj): strikeChannelObj is TextChannel => strikeChannelObj.type === 0)(strikeChannelObj)) return;

// //         offenseChannelObj?.send('Processing Strikes, Please wait');
// //         const replyMessage = await ticketStrikeMessage(message);
// //         strikeChannelObj?.send(replyMessage);
// //       } catch (error) {
// //         Logger.error(error);
// //       }
// //     }
// //   }

// //   if (message.channelId.toString() === strikeChannelId?.toString()) {
// //     const strikeLimit = ':x::x::x:';
// //     if (message.content.includes(strikeLimit)) {
// //       addThreeStrikeRole(message);
// //     }
// //   }
// // });

// client.login(config.token);
