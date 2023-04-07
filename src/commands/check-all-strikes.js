const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildDb } = require('../utils/database/guild-db');

module.exports = {
  data: new SlashCommandBuilder().setName('checkallstrikes').setDescription('Check strikes for all members'),

  async execute(interaction) {
    const serverId = interaction.guild.id;
    const guildSearch = await guildDb.findAll({ where: { ServerId: serverId } });

    let reply = 'Here is the list of guild strikes:';
    guildSearch.forEach(member => {
      reply += `\n\n${member.Name}: \nstrikes: ${member.Strikes} \nlifetime strikes: ${member.TotalStrikes}`;
    });
    await interaction.reply(reply);
  },
};
