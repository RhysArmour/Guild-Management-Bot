import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { removeAllStrikes } from '../../methods/remove-all-strikes';

export default new Command({
  name: 'removeallstrikes',
  description: 'remove all strikes from all players',
  defaultMemberPermissions: 'KickMembers',

  execute: async ({ interaction }, server) => {
    try {
      Logger.info('Remove All Strikes command executed');
      const result = await removeAllStrikes(interaction, server);
      Logger.info('All Strikes Removed');
      return {
        title: 'Remove all strikes',
        fields: [{ name: 'Message', value: result }],
      };
    } catch (error) {
      Logger.error(error);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occurred whilst removing strikes.' }],
      };
    }
  },
});
