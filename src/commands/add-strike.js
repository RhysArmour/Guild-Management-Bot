const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { assignStrikes } = require('../utils/database/guild-db');
const { botDb } = require('../utils/database/bot-db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addstrikes')
    .setDescription('Check strikes for one or multiple members')
    .addUserOption((option) => {
      return option
        .setName('user')
        .setDescription('User you want to add strikes too')
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName('reason')
        .setDescription('reason for strike')
        .setRequired(true)
        .addChoices(
          { name: 'Ticket Offense', value: 'Ticket Offense' },
          { name: 'Tb Phase 1 Offense', value: 'Tb Phase 1 Offense' },
          { name: 'Tb Phase 2 Offense', value: 'Tb Phase 2 Offense' },
          { name: 'Tb Phase 3 Offense', value: 'Tb Phase 3 Offense' },
          { name: 'Tb Phase 4 Offense', value: 'Tb Phase 4 Offense' },
          { name: 'Tb Phase 5 Offense', value: 'Tb Phase 5 Offense' },
          { name: 'Tb Phase 6 Offense', value: 'Tb Phase 6 Offense' },
          { name: 'Missed Tw Signup', value: 'Missed Tw Signup' },
          {
            name: 'Did not meet minimum rogue actions',
            value: 'Did not meet minimum rogue actions',
          },
          { name: 'Unique Strike', value: 'Unique Strike' },
        );
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const getUser = interaction.options.getUser('user');
    const serverId = interaction.guild.id;
    const user = getUser.username;
    const tag = `<@${getUser.id}>`;
    const reason = interaction.options.getString('reason');
    const strike = ':x:';
    try {
      const result = await assignStrikes(getUser, serverId);
      if (typeof result === 'string') {
        return interaction.reply(result);
      }
      const strikes = result.Strikes;
      const record = await botDb.findOne({
        where: { Name: 'Strike Channel', ServerId: serverId },
      });
      const message = `${strike} has been added to ${tag} - ${reason}.\n\n ${user} now has ${strikes} strikes ${strike.repeat(
        strikes,
      )}`;
      interaction.guild.channels.cache.get(record.UniqueId).send(message);
      interaction.reply({
        content: `Strike for ${user} has been updated. ${user} now has ${strikes} strikes`,
        ephemeral: true,
      });
      return;
    } catch (error) {
      console.log(error);
    }
  },
};
