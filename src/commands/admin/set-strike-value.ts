import { ApplicationCommandOptionType } from 'discord.js';
import { Logger } from '../../logger';
import { choices } from '../../utils/commandVariables';
import { StrikeValuesTableService } from '../../database/services/strike-values-services';

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
      choices,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'value',
      description: 'The value that will be assigned whenever a member receives this strike.',
      required: true,
    },
  ],
  execute: async ({ interaction }) => {
    try {
      Logger.info('Add Strikes command executed');

      const strikeReason = interaction.options.getString('strike') as string;
      const value = interaction.options.getInteger('value');

      const existingValue = await StrikeValuesTableService.getStrikeValueObjectByInteraction(interaction, strikeReason);

      if (!existingValue) {
        await StrikeValuesTableService.createStrikeValuesByInteraction(interaction, { strikeReason, value });
      } else {
        await StrikeValuesTableService.updateStrikeValuesByInteraction(interaction, { strikeReason, value });
      }
      Logger.info('Strike value added');

      return {
        content: undefined,
        message: 'Strike value updated.',
      };
    } catch (error) {
      Logger.error(error);
      await interaction.reply({
        content: 'Something went wrong.',
        ephemeral: true,
      });
    }
  },
};
