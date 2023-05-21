import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('user').setDescription('Provides user info!'),
  async execute(interaction: CommandInteraction) {
    await interaction.reply(`user name: ${interaction.user.id}`);
  },
};
