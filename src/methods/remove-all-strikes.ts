import { CommandInteraction } from 'discord.js';
import { Logger } from '../logger';
import { MemberTableServices } from '../database/services/member-services';
import { StrikeReasonsServices } from '../database/services/strike-reason-services';

export const removeAllStrikes = async (interaction: CommandInteraction) => {
  const serverId = interaction.guild.id;

  try {
    Logger.info('Removing All Strikes');
    await MemberTableServices.updateAllStrikesWithServerId(serverId);
    Logger.info('All Strikes removed successfully');

    await StrikeReasonsServices.deleteManyStrikeReasonEntriesByServerId(serverId);
    Logger.info('All Strikes Reasons removed successfully');

    return 'All member strikes removed';
  } catch (error) {
    Logger.error(`Error in removeAllStrikes: ${error}`);
    await interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true,
    });
  }
};
