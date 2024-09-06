import { APIEmbed, ApplicationCommandOptionType } from 'discord.js';
import { Logger } from '../../logger';
import { strikeChoicesAutocomplete } from '../../utils/helpers/commandVariables';
import { addStrike } from '../../methods/add-strike';
import { Command } from '../../classes/Commands';
import { ServerTableService } from '../../database/services/server-services';

export default new Command({
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
      autocomplete: true,
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
      autocomplete: true,
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
      autocomplete: true,
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
      autocomplete: true,
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
      autocomplete: true,
    },
    // Add more user and reason options as needed
  ],
  autocomplete: async ({ interaction }) => {
    await strikeChoicesAutocomplete(interaction);
  },
  execute: async ({ interaction }) => {
    try {
      Logger.info('Add Strikes command executed');

      if (!interaction.guildId) {
        throw new Error();
      }

      const server = await ServerTableService.getServerTableByServerId(interaction.guildId);

      if (!server) {
        return {};
      }

      const strikes = await addStrike(interaction, server);

      const result: APIEmbed = { title: 'Added Strikes', fields: [{ name: 'Content', value: strikes }] };

      Logger.info('Strikes Added');

      return result;
    } catch (error) {
      Logger.error(error);
      await interaction.reply({
        content: 'Something went wrong.',
        ephemeral: true,
      });
    }
  },
});
