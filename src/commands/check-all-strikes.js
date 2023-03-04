const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildDb } = require('../utils/database/guild-db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkallstrikes')
    .setDescription('Check strikes for all members'),

  async execute(interaction) {
    const serverId = interaction.guild.id;
    console.log('SERVER ID', serverId)

    const guildSearch = await guildDb.findAll({ where: { ServerId: serverId } });
    console.log(Object.keys(guildSearch))

    // const ids = Array.from({ length: guildSearch }, (_, index) => index + 1);

    let reply = 'Here is the list of guild strikes:';
    for await (member of guildSearch) {
      reply =
        reply +
        `\n\n${member.Name}: \nstrikes: ${member.Strikes} \nlifetime strikes: ${member.TotalStrikes}`;
    }
    await interaction.reply(reply);
  },
};
