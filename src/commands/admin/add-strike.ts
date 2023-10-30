import { ApplicationCommandOptionType } from 'discord.js';
import { Logger } from '../../logger';
import { choices } from '../../utils/commandVariables';
import { addStrike } from '../../methods/add-strike';

export default {
  name: 'addstrikes',
  description: 'Adds strikes for one or multiple members',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: 'user1',
      description: 'First User',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'reason1',
      description: "First User's Strike Reason",
      required: true,
      choices,
    },
    {
      type: ApplicationCommandOptionType.User,
      name: 'user2',
      description: 'Second User',
      required: false,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'reason2',
      description: "Second User's Strike Reason",
      required: false,
      choices,
    },
    {
      type: ApplicationCommandOptionType.User,
      name: 'user3',
      description: 'Third User',
      required: false,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'reason3',
      description: "Third User's Strike Reason",
      required: false,
      choices,
    },
    {
      type: ApplicationCommandOptionType.User,
      name: 'user4',
      description: 'Fourth User',
      required: false,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'reason4',
      description: "Fourth User's Strike Reason",
      required: false,
      choices,
    },
    {
      type: ApplicationCommandOptionType.User,
      name: 'user5',
      description: 'Fifth User',
      required: false,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'reason5',
      description: "Fifth User's Strike Reason",
      required: false,
      choices,
    },
    // Add more user and reason options as needed
  ],
  execute: async ({ interaction }) => {
    try {
      Logger.info('Add Strikes command executed');
      if (interaction.options._hoistedOptions.length % 2 !== 0) {
        return {
          message: 'You must select a user and the reason for the strike.',
          content: undefined,
        };
      }

      const strikes = await addStrike(interaction);

      Logger.info('Strikes Added');

      return strikes;
    } catch (error) {
      Logger.error(error);
      await interaction.reply({
        content: 'Something went wrong.',
        ephemeral: true,
      });
    }
  },
};