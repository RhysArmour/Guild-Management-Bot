import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, User } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';

export default new Command({
  name: 'usersearch',
  description: 'searches for registered users',
  options: [
    {
      name: 'user',
      description: 'Choose the member to see if they are registered',
      type: 6,
      required: true,
    },
  ],
  execute: async ({ interaction }) => {
    interaction.followUp('Users');
  },
});