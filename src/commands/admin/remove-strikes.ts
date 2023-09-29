import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { removeStrikeFromMember } from '../../methods/remove-strikes';
import { choices } from '../../utils/commandVariables';

export default new Command({
  name: 'removestrikes',
  description: 'remove desired number of strikes from player',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      name: 'user',
      description: 'Member you want to remove strikes from',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'strike1',
      description: 'The 1st strike you want to remove from member',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: choices
    },
    {
      name: 'reason1',
      description: 'Reason for removing strike from member (optional)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'strike2',
      description: 'The 2nd strike you want to remove from member',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: choices
    },
    {
      name: 'reason2',
      description: 'Reason for removing strike from member (optional)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'strike3',
      description: 'The 3rd strike you want to remove from member',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: choices
    },
    {
      name: 'reason3',
      description: 'Reason for removing strike from member (optional)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },

  ],
  execute: async ({ interaction }) => {
    const result = removeStrikeFromMember(interaction)
    return result
  },
});
