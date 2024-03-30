import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { getMembersWhoAreUnregistered } from '../../methods/unregistered-members';

export default new Command({
  name: 'whoisunregistered',
  description: 'Check who is unregistered with the bot',

  execute: async ({ interaction }, server) => {
    try {
      Logger.info('Beginning Check for unregistered Members');
      const members = await getMembersWhoAreUnregistered(interaction, server);
      Logger.info('Member Registration Completed');
      const result = {
        title: 'Unregistered Member',
        fields: [{ name: 'Message', value: members }],
      };

      return result;
    } catch (error) {
      Logger.error(`Error: ${error}`);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occurred whilst checking for unregistered members.' }],
      };
    }
  },
});

