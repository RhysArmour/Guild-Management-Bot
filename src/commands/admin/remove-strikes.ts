import { ApplicationCommandOptionType } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { removeStrikeFromMember } from '../../methods/remove-strikes';
import { choices } from '../../utils/commandVariables';

export default new Command({
  name: 'removestrikes',
  description: 'Remove desired number of strikes from a player',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      name: 'user',
      description: 'Member you want to remove strikes from',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'strike',
      description: 'The 1st strike you want to remove from the member',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices,
    },
    {
      name: 'reason',
      description: 'Reason for removing the 1st strike (optional)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  execute: async ({ interaction }) => {
    try {
      const result = await removeStrikeFromMember(interaction);
      Logger.info(`Removed strikes for user ${interaction.user.username}`);
      return {
        content: result,
        message: 'Strikes successfully removed.',
      };
    } catch (error) {
      Logger.error(`Error while removing strikes: ${error}`);
      await interaction.reply({
        content: 'An error occurred while removing strikes.',
        ephemeral: true,
      });
    }
  },
});
