import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { Logger } from '../logger';
import { MemberTableServices } from '../database/services/member-services';
import { StrikeReasonsServices } from '../database/services/strike-reason-services';
import { ServerWithRelations } from '../interfaces/database/server-table-interface';
import { validateInteractionType, validateServerChannels } from '../utils/validation';

export const addStrike = async (
  interaction: ChatInputCommandInteraction,
  server: ServerWithRelations,
): Promise<string> => {
  try {
    Logger.info('Beginning Adding Strike');

    // Validation
    validateInteractionType(interaction);
    const { strikeChannelId, strikeChannelName } = validateServerChannels(server);

    Logger.info('Validation Complete, Setting Variables');

    // Setup Variables
    const strike = ':x:';
    let message = '';
    const length = interaction.options.data[0].options.length;

    Logger.info('Variables Set, Starting Strike Loop');

    // Assign strike Loop
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

      message += `- ${strike.repeat(strikeValue)} has been added to ${tag} - ${reason}.\n   - ${displayName} now has ${
        result.strikes
      } strikes ${strike.repeat(result.strikes)}\n\n`;
    }

    // Send Strike Message
    const strikeChannel = interaction.guild?.channels.cache.get(strikeChannelId!.toString()) as TextChannel;

    if (!strikeChannel) {
      Logger.error(`Strike channel with ID ${strikeChannelId} does not exist.`);
      return message;
    }

    await strikeChannel.send(message);
    Logger.info(`Strike message sent to strike channel with ID: ${strikeChannelName}`);
    return message;
  } catch (error) {
    Logger.error(`Error in 'addStrike': ${error}`);
    await interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true,
    });
  }
};
