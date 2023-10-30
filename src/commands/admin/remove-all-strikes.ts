import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { removeAllStrikes } from '../../methods/remove-all-strikes';

export default new Command({
  name: 'removeallstrikes',
  description: 'remove all strikes from all players',
  defaultMemberPermissions: 'KickMembers',

  execute: async ({ interaction }) => {
    try {
      Logger.info('Remove All Strikes command executed');
      const result = await removeAllStrikes(interaction);
      Logger.info('All Strikes Removed');
      return {
        content: result,
        message: 'All member strikes and strike reasons have been removed.',
      };
    } catch (error) {
      Logger.error(error);
      await interaction.reply({
        content: 'Something went wrong.',
        ephemeral: true,
      });
    }
  },
});
