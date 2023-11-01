import { ApplicationCommandOptionType, InteractionType } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { GuildSetup } from '../../methods/bot-setup';

export default new Command({
  name: 'setupserver',
  description: 'Sets the role you desire to be used as your "away" role for strikes to be forgiven',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      name: 'triggerphrase',
      description: 'Role which is used to show the guild role',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'strikeresetperiod',
      description: 'Role which is used to show a player will be absent',
      type: ApplicationCommandOptionType.Integer,
      choices: [
        {
          name: '1 month',
          value: 1,
        },
        {
          name: '2 month',
          value: 2,
        },
        {
          name: '3 month',
          value: 3,
        },
        {
          name: '4 month',
          value: 4,
        },
        {
          name: '5 month',
          value: 5,
        },
        {
          name: '6 month',
          value: 6,
        },
      ],
      required: false,
    },
  ],

  execute: async ({ interaction }) => {
    try {
      Logger.info('Bot Setup command executed');

      if (!isValidInteraction(interaction)) {
        return undefined;
      }

      Logger.info('Retrieving Guild Data from Interaction.');

      const serverData = extractServerData(interaction);

      if (!serverData.triggerPhrase && !serverData.strikeResetPeriod) {
        return 'Must select at least 1 option to set up.';
      }

      Logger.info('Data Successfully Retrieved');

      const setupData = await GuildSetup.setupGuildServer(interaction, serverData);

      Logger.info('Guild data setup completed');

      return {
        content: setupData,
        message: 'Server data set successfully',
      };
    } catch (error) {
      Logger.error(`An error occurred in the Bot Setup command: ${error}`);
      return 'An error occurred while setting up guild data. Please try again later.';
    }
  },
});

function isValidInteraction(interaction) {
  return interaction.type === InteractionType.ApplicationCommand && interaction.isChatInputCommand();
}

function extractServerData(interaction) {
  return {
    triggerPhrase: interaction.options.getString('triggerphrase'),
    strikeResetPeriod: interaction.options.getInteger('strikeresetperiod'),
  };
}
