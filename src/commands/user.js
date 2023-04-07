const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder().setName('user').setDescription('Provides user info!'),
  async execute(interaction) {
    await interaction.reply(`user name: ${interaction.user.id}`);
  },
};
