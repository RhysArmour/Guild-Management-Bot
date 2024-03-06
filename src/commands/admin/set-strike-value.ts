import { ApplicationCommandOptionType } from 'discord.js';
import { Logger } from '../../logger';
import { strikeChoicesAutocomplete } from '../../utils/helpers/commandVariables';
import { StrikeValuesTableService } from '../../database/services/strike-values-services';
import { ServerWithRelations } from '../../interfaces/database/server-table-interface';

export default {
  name: 'setstrikevalue',
  description: 'Change the value of a chosen strike.',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'strike',
      description: 'The Strike you wish to change the value of.',
      required: true,
      autocomplete: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'value',
      description: 'The value that will be assigned whenever a member receives this strike.',
      required: true,
    },
  ],
  autocomplete: async ({ interaction }) => {
    await strikeChoicesAutocomplete(interaction);
  },
  execute: async ({ interaction }, server: ServerWithRelations) => {
    try {
      Logger.info('Add Strikes command executed');
      const strikeReason = interaction.options.getString('strike') as string;
      const value = interaction.options.getInteger('value');

      const existingValue = server.guildStrikes.find((strike) => strike.strikeReason === strikeReason);

      if (!existingValue) {
        await StrikeValuesTableService.createStrikeValuesByInteraction(interaction, { strikeReason, value });
      } else {
        await StrikeValuesTableService.updateStrikeValuesByInteraction(interaction, { strikeReason, value });
      }
      Logger.info('Strike value added');

      return {
        title: 'Set Strike Value',
        fields: [{ name: 'Message', value: 'Strike value updated.' }],
      };
    } catch (error) {
      Logger.error(error);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occurred whilst setting strike value.' }],
      };
    }
  },
};
