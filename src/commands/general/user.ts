import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';


export default new Command({
  name: 'user',
  description: 'Provides user info!',
  execute: async ({ interaction }) => {
    interaction.followUp('Pong')
  }
})


// export const data = new SlashCommandBuilder().setName('user').setDescription('Provides user info!');

// export async function execute(interaction: CommandInteraction) {
//   await interaction.reply(`user name: ${interaction.user.id}`);
// }
