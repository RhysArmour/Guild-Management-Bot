import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { getReactions } from '../../methods/get-reactions';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command({
  name: 'checkreactions',
  description: 'Check who in your guild role has reacted to the message and who has not.',
  options: [
    {
      name: `channel`,
      description: 'The channel that the message is in',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: `messageid`,
      description: 'The message Id of the message you wish to see the reactions for',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'role',
      description: 'role of the members you want to check the reactions for',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],

  execute: async ({ interaction }) => {
    try {
      Logger.info('Beginning see reactions Command');
      const result = await getReactions(interaction);
      return result;
    } catch (error) {
      Logger.error(`Error: ${error}`);
    }
  },
});
