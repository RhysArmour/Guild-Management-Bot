import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { checkStrikes } from '../../methods/check-strike';
import { ServerWithRelations } from '../../interfaces/database/server-table-interface';

export default new Command({
  name: 'checkstrikes',
  description: 'Check strikes for one or more specific members',
  options: [
    ...Array.from({ length: 10 }, (_, i) => ({
      name: `user${i + 1}`,
      description: 'The user that you would like to see the strikes for.',
      type: 6,
      required: false,
    })),
  ],

  execute: async ({ interaction }, server: ServerWithRelations) => {
    try {
      Logger.info(`Beginning Check Strike Command for server: ${server.serverId}`);
      const result = await checkStrikes(interaction, server);
      return {
        title: 'Check Strikes',
        fields: [{ name: 'Message', value: result }],
      };
    } catch (error) {
      Logger.error(`Error: ${error}`);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occured whilst checking strikes' }],
      };
    }
  },
});
