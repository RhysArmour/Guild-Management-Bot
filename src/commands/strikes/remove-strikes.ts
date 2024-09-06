import { ApplicationCommandOptionType } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { removeStrikeFromMember } from '../../methods/remove-strikes';
import { strikeChoicesAutocomplete } from '../../utils/helpers/commandVariables';

export default new Command({
  name: 'removestrikes',
  description: 'Remove desired number of strikes from a player',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      name: 'user',
      description: 'Member you want to remove strikes from',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'strike',
      description: 'The 1st strike you want to remove from the member',
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
    {
      name: 'reason',
      description: 'Reason for removing the 1st strike (optional)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  autocomplete: async ({ interaction }) => {
    await strikeChoicesAutocomplete(interaction);
  },
  execute: async ({ interaction }, server) => {
    try {
      const result = await removeStrikeFromMember(interaction, server);
      return {
        title: 'Remove Strikes',
        fields: [{ name: 'Message', value: result }],
      };
    } catch (error) {
      Logger.error(`Error while removing strikes: ${error}`);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occurred whilst removing strikes.' }],
      };
    }
  },
});
