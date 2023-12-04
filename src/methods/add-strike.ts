import { CommandInteraction, GuildMember, InteractionType, TextChannel } from 'discord.js';
import { Logger } from '../logger';
import { MemberTableServices } from '../database/services/member-services';
import { StrikeReasonsServices } from '../database/services/strike-reason-services';
import { StrikeValuesTableService } from '../database/services/strike-values-services';
import { ChannelTableService } from '../database/services/channel-services';

export const addStrike = async (interaction: CommandInteraction) => {
  try {
    if (interaction.type !== InteractionType.ApplicationCommand || !interaction.isChatInputCommand()) {
      Logger.info('Interaction is not an Application Command');
      return undefined;
    }
    Logger.info('Beginning Adding Strike');

    const serverId = interaction.guildId!;
    const { strikeChannelId, strikeChannelName } = await ChannelTableService.getChannelsByServerId(serverId);

    if (!strikeChannelId || !strikeChannelName) {
      Logger.error('Strike channel not found in the database.');
      await interaction.reply({
        content: 'Strike channel not found in the database.',
        ephemeral: true,
      });
      return;
    }

    Logger.info(`Database entry found for server: ${serverId}`);

    const strike = ':x:';
    let message = '';
    const length = interaction.options.data.length;
    let reply = '';

    Logger.info(`Server ID: ${serverId}`);
    Logger.info(`Strike Channel Name & ID: ${strikeChannelName}: ${strikeChannelId}`);

    for (let i = 0; i < length / 2; i += 1) {
      const member = interaction.options.getMember(`user${i + 1}`) as GuildMember;
      const reason = (interaction.options.get(`reason${i + 1}`)?.value as string) ?? '';

      if (reason.includes('Ticket Strike')) Logger.info(`${member.displayName}\n${reason}`);
      const { id, displayName } = member;
      const tag = `<@${id}>`;

      Logger.info(`Processing strike for User ID: ${id}, Username: ${displayName}, Reason: ${reason}`);

      let memberRecord = await MemberTableServices.getMemberWithMember(member);

      if (!memberRecord) {
        memberRecord = await MemberTableServices.createMemberWithMember(member);
      }

      const strikeValue = await StrikeValuesTableService.getIndividualStrikeValueByInteraction(interaction, reason);

      const result = await MemberTableServices.addMemberStrikesWithMember(member, strikeValue);
      const reasons = await StrikeReasonsServices.createStrikeReasonByMember(member, reason);

      Logger.info(result);
      Logger.info(`Reasons: ${reasons}`);

      message += `- ${strike} has been added to ${tag} - ${reason}.\n   - ${displayName} now has ${
        result.strikes
      } strikes ${strike.repeat(result.strikes)}\n\n`;
      reply += `- Strike for ${displayName} has been updated. ${displayName} now has ${result.strikes} strikes\n\n`;
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
      return {
        message: 'strikes successfully added',
        content: message,
      };
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
