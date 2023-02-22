const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { guildDb } = require('../utils/database/guild-db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearallstrikes')
    .setDescription('Clear all strikes from players')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const serverId = interaction.guild.id;

    try {
      const numberOfIds = await guildDb.count({
        where: { ServerId: serverId },
      });

      const ids = Array.from({ length: numberOfIds }, (_, index) => index + 1);

      for await (i of ids) {
        await guildDb.update(
          { Strikes: 0 },
          { where: { id: i }, ServerId: serverId },
        );
      }
      await interaction.reply('All strikes cleared');
      return;
    } catch (error) {
      console.log(error);
    }
  },
};
