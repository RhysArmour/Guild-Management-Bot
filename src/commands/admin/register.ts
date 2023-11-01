import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { registerMembers } from '../../methods/register-members';

export default new Command({
  name: 'register',
  description: 'Registers all members with guild role with the bot',
  defaultMemberPermissions: 'KickMembers',

  execute: async ({ interaction }) => {
    try {
      Logger.info('Beginning Member Registration');
      const result = await registerMembers(interaction);
      Logger.info('Member Registration Completed');
      return result;
    } catch (error) {
      Logger.error(`Error: ${error}`);
    }
  },
});
