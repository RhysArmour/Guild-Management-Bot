import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { ServerWithRelations } from '../../interfaces/database/server-table-interface';
import { ApplicationCommandOptionType } from 'discord.js';
import { strikeChoicesAutocomplete } from '../../utils/helpers/commandVariables';
import { showStrikeValues } from '../../methods/show-strikes-values';

export default new Command({
  name: 'showstrikevalue',
  description: 'Show the 1 or all strike values.',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'strike',
      description: 'The Strike you wish to change the value of.',
      required: false,
      autocomplete: true,
    },
  ],

  autocomplete: async ({ interaction }) => {
    await strikeChoicesAutocomplete(interaction);
  },

  execute: async ({ interaction }, server: ServerWithRelations) => {
    try {
      Logger.info(`Beginning Show Strike Value Command for server: ${server.serverId}`);
      const result = await showStrikeValues(interaction, server);
      return result;
    } catch (error) {
      Logger.error(`Error: ${error}`);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occured whilst checking strikes' }],
      };
    }
  },
});

