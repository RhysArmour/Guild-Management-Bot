import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { registerMembers } from '../../methods/register-members';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command({
  name: 'register',
  description: 'Registers all members with guild role with the bot',
  options: [
    {
      name: 'allycode',
      description: 'The ally code of the member you want to register',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'member',
      description: 'The Member you want to register',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],

  execute: async ({ interaction }, server) => {
    try {
      Logger.info('Beginning Member Registration');
      const register = await registerMembers(interaction, server);
      Logger.info('Member Registration Completed');
      const result = {
        title: 'Register Member',
        fields: [{ name: 'Message', value: register }],
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
