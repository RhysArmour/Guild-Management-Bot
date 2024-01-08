import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { resetMonthlyStrikes } from '../../methods/reset-monthly-strikes';

export default new Command({
  name: 'resetmonthlystrikes',
  description: '(Admin)Remove strikes from a given month',
  defaultMemberPermissions: 'KickMembers',

  execute: async ({ interaction }) => {
    try {
      Logger.info('Resetting monthly strikes.');
      const result = await resetMonthlyStrikes(interaction);
      Logger.info('Monthly strikes reset');
      return {
        content: result,
        message: 'Successfully removed all strikes from last month.',
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
