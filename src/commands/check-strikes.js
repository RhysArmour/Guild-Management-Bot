const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildDb } = require('../utils/database/guild-db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkstrikes')
    .setDescription('Check strikes for one member')
    .addUserOption((option) => option.setName('user').setDescription('User you want to clear strikes from')),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user');
      const name = user.username;
      const serverId = interaction.guild.id;
      const result = await guildDb.findOne({
        where: { Name: name, UniqueId: user.id, ServerId: serverId },
      });

      if (result === null) {
        return interaction.reply(
          'Player is not registered with Bot. This is because they have not attained any strikes or have not been registered manually',
        );
      }

      const strikes = result.Strikes;
      const totalStrikes = result.TotalStrikes;

      await interaction.reply(`${name} has ${strikes} strikes this month and ${totalStrikes} lifetime strikes`);

      return;
    } catch (error) {
      console.log(error);
    }
  },
};
