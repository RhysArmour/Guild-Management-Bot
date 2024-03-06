import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { resetMonthlyStrikes } from '../../methods/reset-monthly-strikes';

export default new Command({
  name: 'resetmonthlystrikes',
  description: '(Admin)Remove strikes from a given month',
  defaultMemberPermissions: 'KickMembers',

  execute: async ({ interaction }, server) => {
    try {
      Logger.info(`Resetting monthly strikes for server: ${server.serverId}`);

      await resetMonthlyStrikes(interaction);
      Logger.info('Monthly strikes reset');
      return {
        title: 'Reset Monthly Strikes',
        fields: [{ name: 'Message', value: 'Successfully removed all strikes from last month.' }],
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

