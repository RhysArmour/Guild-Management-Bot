import { CommandInteraction, InteractionType, TextChannel } from 'discord.js';
import prisma from '../utils/database/prisma';
import { Logger } from '../logger';
import { Members, Strikes } from '@prisma/client';
import { removeStrikes } from '../utils/database/services/member-services';

export const removeStrikeFromMember = async (interaction: CommandInteraction) => {
  if (interaction.type !== InteractionType.ApplicationCommand || !interaction.isChatInputCommand()) {
    Logger.info('Interaction is not an Application Command');
    return undefined;
  }

  try {
    Logger.info('Beggining Remove Strike Service');
    const serverId = interaction.guildId!;
    const { strikeChannelId, strikeChannelName } = await prisma.strikes.findUnique({
      where: { serverId: serverId },
    });
    Logger.info('Database entry found');
    const strike = ':x:';
    let message = '';
    const length = interaction.options.data.length;

    Logger.info(`Server ID: ${serverId}`);
    Logger.info(`Strike Channel Name & ID: ${strikeChannelName}: ${strikeChannelId}`);
    let strikeAmount = 0;
    let strikesToRemove = [];

    for (let i = 1; i < length; i++) {
      strikeAmount += 1;
      const strike = interaction.options.getString(`strike${strikeAmount}`);
      const reason = (interaction.options.get(`reason${strikeAmount}`)?.value as string) ?? '';
      const strikeObject = {
        strike,
        reason,
      };
      strikesToRemove.push(strikeObject);
    }
    const user = interaction.options.getUser(`user`)!;
    const { id, username } = user;
    const tag = `<@${id}>`;
    // Logger.info(`Processing strike for User ID: ${id}, Username: ${username}, Reason: ${reason}`);
    const { removeStrikeMessage, result } = await removeStrikes(user, serverId, strikesToRemove);
    if (removeStrikeMessage === 'Member has no strikes to remove') {
      return `${username} doesn't have enough strikes to remove ${strikeAmount} strike. Please try with less strikes or check the users strike amount using checkStrikes command`;
    }
    Logger.info(result);
    let strikes: number;
    ({ strikes } = result as Members);
    message += `Remove strike status for ${tag}\n - ${
      removeStrikeMessage
    }${username} now has ${strikes} strikes ${strike.repeat(strikes)}\n\n`;

    Logger.info(`Strike Message: ${message}`);

    const strikeChannel = interaction.guild?.channels.cache.get(strikeChannelId!.toString()) as TextChannel;
    if (strikeChannel) {
      await strikeChannel.send(message);
      Logger.info(`Strike message sent to strike channel with \n Name: ${strikeChannelName} \n ID: ${strikeChannelId}`);
      return 'Strikes removed successfully';
    } else {
      Logger.error(`Strike channel with ID ${strikeChannelId} does not exist.`);
    }
    return;
  } catch (error) {
    Logger.error(error);
    await interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true,
    });
  }
};
