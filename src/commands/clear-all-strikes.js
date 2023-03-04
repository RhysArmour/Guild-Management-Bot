const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { guildDb } = require('../utils/database/guild-db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearallstrikes')
    .setDescription('Clear all strikes from players')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const serverId = interaction.guild.id;

    try {
      const guildSearch = await guildDb.findAll({
        where: { ServerId: serverId },
      });



      for await (member of guildSearch) {
        await guildDb.update(
          { Strikes: 0 },
          { where: { id: member.id }, ServerId: serverId },
        );
      }
      await interaction.reply('All strikes cleared');
      return;
    } catch (error) {
      console.log(error);
    }
  },
};
