import { CommandInteraction, GuildMember } from 'discord.js';
import { Logger } from '../logger';
import { MemberTableServices } from '../database/services/member-services';
import { currentDate } from '../utils/helpers/get-date';
import { ChannelTableService } from '../database/services/channel-services';
import { StrikeReasonsServices } from '../database/services/strike-reason-services';
import { StrikeValuesTableService } from '../database/services/strike-values-services';

export const checkStrikes = async (interaction: CommandInteraction) => {
  try {
    Logger.info('Beginning check Strikes.');
    const { currentMonth } = currentDate();
    const serverId = interaction.guildId!;
    const { strikeChannelId, strikeChannelName } = await ChannelTableService.getChannelsByServerId(serverId);
    if (!strikeChannelId || !strikeChannelName) {
      Logger.error(`Guild Data is missing ${strikeChannelId} or ${strikeChannelName}`);
      throw Error('Guild setup is incomplete.');
    }
    Logger.info('Database entry found');
    const strike = ':x:';
    let message = '';
    const length = interaction.options.data.length;

    Logger.info(`Server ID: ${serverId}`);
    Logger.info(`Strike Channel Name & ID: ${strikeChannelName}: ${strikeChannelId}`);

    for (let i = 0; i < length; i += 1) {
      const member = interaction.options.getMember(`user${i + 1}`) as GuildMember;
      const { id, displayName } = member;

      Logger.info(`Processing info for member ID: ${id}, name: ${displayName}`);

      const { strikes, lifetimeStrikes, strikeReasons } = await MemberTableServices.getAllStrikeReasonsByMember(member);

      const filteredReasons = await StrikeReasonsServices.filterStrikeByResetPeriod(strikeReasons, serverId);
      const guildStrikeValuesRecord = await StrikeValuesTableService.getAllGuildStrikeValueObjectByServerId(serverId);

      const reasonList = await StrikeReasonsServices.getReasonsList(filteredReasons, guildStrikeValuesRecord);
      const strikesForMonthMessage = `- strikes for ${currentMonth}:\n ${reasonList}\n`;

      if (reasonList !== '') {
        message += `${i + 1}. ${displayName} has ${strikes} strikes ${strike.repeat(
          strikes,
        )} and ${lifetimeStrikes} Lifetime Strikes ${strikesForMonthMessage}`;
      } else {
        message += `${i + 1}. ${displayName} has ${strikes} strikes ${strike.repeat(
          strikes,
        )} and ${lifetimeStrikes} Lifetime Strikes\n - ${displayName} has had no strikes in ${currentMonth}.\n`;
      }
    }

    Logger.info(`getStrikes Message: ${message}`);

    return message;
  } catch (error) {
    Logger.error(`Error in checkStrikes: ${error}`);
    await interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true,
    });
  }
};
