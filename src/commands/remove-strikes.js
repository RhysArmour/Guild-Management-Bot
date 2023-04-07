const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { guildDb } = require('../utils/database/guild-db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removestrikes')
    .setDescription('Clear desired number of strikes from player')
    .addUserOption((option) => option.setName('user').setDescription('User you want to clear strikes from'))
    .addIntegerOption((option) => option.setName('amount').setDescription('amount of stirkes you want to clear'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    // const name = user?.username;
    const serverId = interaction.guild.id;
    const integer = interaction.options.getInteger('amount');

    try {
      if (user && integer) {
        const result = await guildDb.findOne({
          where: { Name: user.username, UniqueId: user.id, ServerId: serverId },
        });
        if (result === null) {
          return interaction.reply(
            'Player is not registered with Bot. This is because they have not attained any strikes or have not been registered manually',
          );
        }

        if (result.Strikes === 0) {
          await interaction.reply(`Cannot remove ${integer} from ${user} because they have zero strikes`);
          return;
        }
        const strikes = result.Strikes - integer;
        if (strikes < 0) {
          await interaction.reply(
            `Cannot remove more strikes than a member has. Current strikes for ${user} is ${result.Strikes} therefore you can only remove a maximum of ${result.Strikes} `,
          );
          return;
        }

        await guildDb.update(
          { Strikes: strikes },
          {
            where: {
              Name: user.username,
              UniqueId: user.id,
              ServerId: serverId,
            },
          },
        );
        await interaction.reply(`${integer} strike(s) have been removed from ${user.username}`);
        return;
      }

      await interaction.reply(
        'Please provide a valid input. If you want all strikes removed, only select "all". if you would like an individuals strikes removed, please use "user" followed by "amount", like so: \n\n /clearstrikes user: {user} amount: {amount} \n or\n /clearstrikes all: true',
      );
    } catch (error) {
      console.log(error);
      await interaction.reply(
        'Please provide a valid input. If you want all strikes removed, only select "all". if you would like an individuals strikes removed, please use "user" followed by "amount", like so: \n\n /clearstrikes user: {user} amount: {amount} \n or\n /clearstrikes all: true',
      );
    }
  },
};
