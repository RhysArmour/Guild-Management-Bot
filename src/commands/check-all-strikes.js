const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildDb } = require('../utils/database/guild-db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkallstrikes')
    .setDescription('Check strikes for all members'),

  async execute(interaction) {
    const serverId = interaction.guild.id;
    const numberOfIds = await guildDb.count({ where: { ServerId: serverId } });
    const ids = Array.from({ length: numberOfIds }, (_, index) => index + 1);
    let reply = 'Here is the list of guild strikes:';
    for await (i of ids) {
      let result = await guildDb.findOne({ where: { id: i } });
      reply =
        reply +
        `\n\n${result.Name}: \nstrikes: ${result.Strikes} \nlifetime strikes: ${result.TotalStrikes}`;
    }
    await interaction.reply(reply);
  },
};
