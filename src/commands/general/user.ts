import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { getUserInfo } from '../../utils/database/services/member-services';


export default new Command({
  name: 'user',
  description: 'Provides user info!',
  options: [
    {
      name: 'user',
      description: 'The user that you would like to see information about',
      type: 6,
      required: true,
    },
  ],
  execute: async ({ interaction }) => {
    const result = await getUserInfo(interaction)
  }
})