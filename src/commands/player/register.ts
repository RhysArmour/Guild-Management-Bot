import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { register } from '../../methods/register';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command({
  name: 'register',
  description: 'Registers all members with guild role with the bot',
  options: [
    {
      name: 'allycode',
      description: 'The ally code of the account you want to register',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'member',
      description: 'The Member you want to register the account to',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: 'altallycode',
      description: 'The alternate account ally code of the account you want to register to the given member',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'secondaltallycode',
      description: 'The second alternate account ally code of the account you want to register to the given member',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  execute: async ({ interaction }, server) => {
    try {
      Logger.info('Beginning Member Registration');
      const registeredUser = await register(interaction, server);
      Logger.info('Member Registration Completed');
      const result = {
        title: 'Register Member',
        fields: [{ name: 'Message', value: registeredUser }],
      };

      return result;
    } catch (error) {
      Logger.error(`Error: ${error}`);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occurred whilst registering member.' }],
      };
    }
  },
});
