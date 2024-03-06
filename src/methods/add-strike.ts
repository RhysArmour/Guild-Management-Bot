import { CommandInteraction, GuildMember, InteractionType, TextChannel } from 'discord.js';
import { Logger } from '../logger';
import { MemberTableServices } from '../database/services/member-services';
import { StrikeReasonsServices } from '../database/services/strike-reason-services';
import { ServerWithRelations } from '../interfaces/database/server-table-interface';

export const addStrike = async (interaction: CommandInteraction, server: ServerWithRelations) => {
  try {
    if (interaction.type !== InteractionType.ApplicationCommand || !interaction.isChatInputCommand()) {
      Logger.info('Interaction is not an Application Command');
      return undefined;
    }

    Logger.info('Beginning Adding Strike');

    const { strikeChannelId, strikeChannelName } = server.channels;

    if (!strikeChannelId || !strikeChannelName) {
      Logger.error('Strike channel not found in the database.');
      await interaction.reply({
        content:
          'Strike channel not found in the database. Please set up the server channels using the command /setupchannels',
        ephemeral: true,
      });
      return;
    }

    Logger.info(`Channels found for server: ${server.serverId}`);

    const strike = ':x:';
    let message = '';
    const length = interaction.options.data.length;

    Logger.info(`Server ID: ${server.serverId}`);
    Logger.info(`Strike Channel Name & ID: ${strikeChannelName}: ${strikeChannelId}`);

    for (let i = 0; i < length / 2; i += 1) {
      const member = interaction.options.getMember(`user${i + 1}`) as GuildMember;
      const reason = (interaction.options.get(`reason${i + 1}`)?.value as string) ?? '';

      if (reason.includes('Ticket Strike')) Logger.info(`${member.displayName}\n${reason}`);
      const { id, displayName } = member;
      const tag = `<@${id}>`;

      Logger.info(`Processing strike for User ID: ${id}, Username: ${displayName}, Reason: ${reason}`);

      const strikeReason = server.guildStrikes.find((strike) => strike.strikeReason === reason);

      const strikeValue = strikeReason ? strikeReason.value : 1;

      const result = await MemberTableServices.addMemberStrikesWithMember(member, strikeValue);
      await StrikeReasonsServices.createStrikeReasonByMember(member, reason);

      message += `- ${strike} has been added to ${tag} - ${reason}.\n   - ${displayName} now has ${
        result.strikes
      } strikes ${strike.repeat(result.strikes)}\n\n`;
    }

    const strikeChannel = interaction.guild?.channels.cache.get(strikeChannelId!.toString()) as TextChannel;
    if (strikeChannel) {
      await strikeChannel.send(message);
      Logger.info(`Strike message sent to strike channel with ID: ${strikeChannelName}`);
      return message;
    } else {
      Logger.error(`Strike channel with ID ${strikeChannelId} does not exist.`);
    }
  } catch (error) {
    Logger.error(`Error in 'addStrike': ${error}`);
    await interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true,
    });
  }
};
