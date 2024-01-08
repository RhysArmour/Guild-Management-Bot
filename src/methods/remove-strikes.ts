import { CommandInteraction, GuildMember, InteractionType, TextChannel } from 'discord.js';
import { Logger } from '../logger';
import { MemberTableServices } from '../database/services/member-services';
import { StrikeReasonsServices } from '../database/services/strike-reason-services';
import { ChannelTableService } from '../database/services/channel-services';
import { StrikeValuesTableService } from '../database/services/strike-values-services';

export const removeStrikeFromMember = async (interaction: CommandInteraction) => {
  if (interaction.type !== InteractionType.ApplicationCommand || !interaction.isChatInputCommand()) {
    Logger.info('Interaction is not an Application Command');
    return undefined;
  }

  try {
    Logger.info('Beginning Remove Strike Service');
    const serverId = interaction.guildId!;
    const { strikeChannelId, strikeChannelName } = await ChannelTableService.getChannelsByServerId(serverId);
    if (!strikeChannelId || !strikeChannelName) {
      Logger.error(`Guild Data is missing ${strikeChannelId} or ${strikeChannelName}`);
      throw Error('Guild setup is incomplete.');
    }
    Logger.info('Database entry found');
    const strike = ':x:';
    let message = '';

    Logger.info(`Server ID: ${serverId}`);

    const member = interaction.options.getMember(`user`) as GuildMember;
    let strikeReason = interaction.options.getString(`strike`);
    const removalReason = interaction.options.getString(`reason`) ?? 'Mistake';
    const { strikeReasons } = await MemberTableServices.getAllStrikeReasonsByMember(member);

    if (strikeReason.includes('Ticket Strike')) {
      const ticketStrikes = await StrikeReasonsServices.getTicketStrikesByMemberWithinResetPeriod(member);
      // TODO: Refactor to compare current date to most recent ticket strike and remove THAT strike
      strikeReason = ticketStrikes[0].reason;
    }

    const strikeReasonExists = strikeReasons.some((reasonEntry) => reasonEntry.reason === strikeReason);

    if (!strikeReasonExists) {
      Logger.error('The strike attempting to be removed does not exist.');
      return {
        message: 'The strike attempting to be removed does not exist.',
        content: undefined,
      };
    }

    const strikeReasonRecords = await StrikeReasonsServices.getManyStrikeReasonsByMemberWithinResetPeriod(
      member,
      strikeReason,
    );

    const { reason, uniqueId, date } = strikeReasonRecords[0];

    const strikeValue = await StrikeValuesTableService.getIndividualStrikeValueByInteraction(interaction, reason);

    // TODO: RENAME updateMemberStrikesByGuildMember to SubtractMemberStrikesByMember and refactor accordingly
    await MemberTableServices.updateMemberStrikesByGuildMember(member, strikeValue);
    await StrikeReasonsServices.deleteStrikeReasonEntryByMember(member, { uniqueId, reason, date });
    const newRecord = await MemberTableServices.getAllStrikeReasonsByMember(member);

    const newStrikeReasons = newRecord.strikeReasons.map((reasonEntry) => reasonEntry.reason);

    const { displayName } = member;

    let reasonList = '';
    let j = 0;
    newStrikeReasons.forEach((reason) => {
      j++;
      reasonList = reasonList + `\n${j}. ${reason}`;
    });

    const currentStrikesMessage = `Strikes:${reasonList}`;

    message += `- ${reason} has been removed from ${displayName} due to ${removalReason}\n - ${displayName} now has ${
      newRecord.strikes
    } strikes ${strike.repeat(newRecord.strikes)}`;

    if (newStrikeReasons.length !== 0) {
      message = message + '\n\n' + currentStrikesMessage;
    }

    Logger.info(`Strike Message: ${message}`);

    const strikeChannel = interaction.guild?.channels.cache.get(strikeChannelId!.toString()) as TextChannel;

    if (strikeChannel) {
      await strikeChannel.send(message);
      Logger.info(`Strike message sent to strike channel with \n Name: ${strikeChannelName} \n ID: ${strikeChannelId}`);
      return {
        content: message,
        message: 'Strikes removed successfully',
      };
    } else {
      Logger.error(`Strike channel with ID ${strikeChannelId} does not exist.`);
    }
    Logger.info('Unkown error occured during remove-strikes');
    return {
      content: undefined,
      message: 'Something Went wrong',
    };
  } catch (error) {
    Logger.error(`Error in removeStrikeFromMember: ${error}`);
    await interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true,
    });
  }
};
