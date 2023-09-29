import { CommandInteraction, InteractionType, TextChannel } from 'discord.js';
import prisma from '../utils/database/prisma';
import { Logger } from '../logger';
import { Members, Strikes } from '@prisma/client';
import { assignStrikes } from '../utils/database/services/member-services';
import { updateReasons } from '../utils/database/services/strike-reason-services';

export const addStrike = async (interaction: CommandInteraction) => {
  if (interaction.type !== InteractionType.ApplicationCommand || !interaction.isChatInputCommand()) {
    Logger.info('Interaction is not an Application Command');
    return undefined;
  }
  try {
    Logger.info('Beggining Adding Strike');
    const serverId = interaction.guildId!;
    const { strikeChannelId, strikeChannelName } = await prisma.strikes.findUnique({
      where: { serverId: serverId },
    });
    Logger.info('Database entry found');
    const strike = ':x:';
    let message = '';
    const length = interaction.options.data.length;
    let reply = '';

    Logger.info(`Server ID: ${serverId}`);
    Logger.info(`Strike Channel Name & ID: ${strikeChannelName}: ${strikeChannelId}`);

    for (let i = 0; i < length / 2; i += 1) {
      const user = interaction.options.getUser(`user${i + 1}`)!;
      const reason = (interaction.options.get(`reason${i + 1}`)?.value as string) ?? '';
      Logger.info(`${user}\n${reason}`);
      const { id, username } = user;
      const tag = `<@${id}>`;

      Logger.info(`Processing strike for User ID: ${id}, Username: ${username}, Reason: ${reason}`);

      const result = await assignStrikes(user, serverId);
      const reasons = await updateReasons(reason, user, serverId);
      Logger.info(result);
      Logger.info(`Reasons: ${reasons}`);
      let strikes: number;
      ({ strikes } = result as Members);
      message += `- ${strike} has been added to ${tag} - ${reason}.\n   - ${username} now has ${strikes} strikes ${strike.repeat(
        strikes,
      )}\n\n`;
      reply += `- Strike for ${username} has been updated. ${username} now has ${strikes} strikes\n\n`;
    }

    Logger.info(`Strike Message: ${message}`);
    Logger.info(`Reply Message: ${reply}`);

    await interaction.followUp({
      content: reply,
      ephemeral: true,
    });

    const strikeChannel = interaction.guild?.channels.cache.get(strikeChannelId!.toString()) as TextChannel;
    if (strikeChannel) {
      await strikeChannel.send(message);
      Logger.info(`Strike message sent to strike channel with ID: ${strikeChannelName}`);
      return 'Strikes successfully added';
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
