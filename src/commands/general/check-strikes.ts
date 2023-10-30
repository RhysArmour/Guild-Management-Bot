import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { checkStrikes } from '../../methods/check-strike';

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

  execute: async ({ interaction }) => {
    try {
      Logger.info('Beginning Check Strike Command');
      const result = await checkStrikes(interaction);
      return {
        content: result,
        message: result,
      };
    } catch (error) {
      Logger.error(`Error: ${error}`);
    }
  },
});
