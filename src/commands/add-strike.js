/* eslint-disable no-underscore-dangle */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { assignStrikes } = require('../utils/database/guild-db');
const { botDb } = require('../utils/database/bot-db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addstrikes')
    .setDescription('Check strikes for one or multiple members')
    .addUserOption((option) =>
      option.setName('user1').setDescription('User you want to add strikes too').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('reason1').setDescription('reason for strike').setRequired(true).addChoices(
        { name: 'Ticket Strike', value: 'Ticket Strike' },
        { name: 'Tb Phase 1 Offense', value: 'Tb Phase 1 Offense' },
        { name: 'Tb Phase 2 Offense', value: 'Tb Phase 2 Offense' },
        { name: 'Tb Phase 3 Offense', value: 'Tb Phase 3 Offense' },
        { name: 'Tb Phase 4 Offense', value: 'Tb Phase 4 Offense' },
        { name: 'Tb Phase 5 Offense', value: 'Tb Phase 5 Offense' },
        { name: 'Tb Phase 6 Offense', value: 'Tb Phase 6 Offense' },
        { name: 'Missed Special Mission', value: 'Missed Special Mission' },
        { name: 'TW Scored less than 150 points total', value: 'TW Scored less than 150 points total' },
        { name: 'Missed Tw Signup', value: 'Missed Tw Signup' },
        {
          name: 'Did not meet minimum rogue actions',
          value: 'Did not meet minimum rogue actions',
        },
        { name: 'Unique Strike', value: 'Unique Strike' },
      ),
    )
    .addUserOption((option) =>
      option.setName('user2').setDescription('User you want to add strikes too').setRequired(false),
    )
    .addStringOption((option) =>
      option.setName('reason2').setDescription('reason for strike').setRequired(false).addChoices(
        { name: 'Ticket Strike', value: 'Ticket Strike' },
        { name: 'Tb Phase 1 Offense', value: 'Tb Phase 1 Offense' },
        { name: 'Tb Phase 2 Offense', value: 'Tb Phase 2 Offense' },
        { name: 'Tb Phase 3 Offense', value: 'Tb Phase 3 Offense' },
        { name: 'Tb Phase 4 Offense', value: 'Tb Phase 4 Offense' },
        { name: 'Tb Phase 5 Offense', value: 'Tb Phase 5 Offense' },
        { name: 'Tb Phase 6 Offense', value: 'Tb Phase 6 Offense' },
        { name: 'Missed Special Mission', value: 'Missed Special Mission' },
        { name: 'TW Scored less than 150 points total', value: 'TW Scored less than 150 points total' },
        { name: 'Missed Tw Signup', value: 'Missed Tw Signup' },
        {
          name: 'Did not meet minimum rogue actions',
          value: 'Did not meet minimum rogue actions',
        },
        { name: 'Unique Strike', value: 'Unique Strike' },
      ),
    )
    .addUserOption((option) =>
      option.setName('user3').setDescription('User you want to add strikes too').setRequired(false),
    )
    .addStringOption((option) =>
      option.setName('reason3').setDescription('reason for strike').setRequired(false).addChoices(
        { name: 'Ticket Strike', value: 'Ticket Strike' },
        { name: 'Tb Phase 1 Offense', value: 'Tb Phase 1 Offense' },
        { name: 'Tb Phase 2 Offense', value: 'Tb Phase 2 Offense' },
        { name: 'Tb Phase 3 Offense', value: 'Tb Phase 3 Offense' },
        { name: 'Tb Phase 4 Offense', value: 'Tb Phase 4 Offense' },
        { name: 'Tb Phase 5 Offense', value: 'Tb Phase 5 Offense' },
        { name: 'Tb Phase 6 Offense', value: 'Tb Phase 6 Offense' },
        { name: 'Missed Special Mission', value: 'Missed Special Mission' },
        { name: 'TW Scored less than 150 points total', value: 'TW Scored less than 150 points total' },
        { name: 'Missed Tw Signup', value: 'Missed Tw Signup' },
        {
          name: 'Did not meet minimum rogue actions',
          value: 'Did not meet minimum rogue actions',
        },
        { name: 'Unique Strike', value: 'Unique Strike' },
      ),
    )
    .addUserOption((option) =>
      option.setName('user4').setDescription('User you want to add strikes too').setRequired(false),
    )
    .addStringOption((option) =>
      option.setName('reason4').setDescription('reason for strike').setRequired(false).addChoices(
        { name: 'Ticket Strike', value: 'Ticket Strike' },
        { name: 'Tb Phase 1 Offense', value: 'Tb Phase 1 Offense' },
        { name: 'Tb Phase 2 Offense', value: 'Tb Phase 2 Offense' },
        { name: 'Tb Phase 3 Offense', value: 'Tb Phase 3 Offense' },
        { name: 'Tb Phase 4 Offense', value: 'Tb Phase 4 Offense' },
        { name: 'Tb Phase 5 Offense', value: 'Tb Phase 5 Offense' },
        { name: 'Tb Phase 6 Offense', value: 'Tb Phase 6 Offense' },
        { name: 'Missed Special Mission', value: 'Missed Special Mission' },
        { name: 'TW Scored less than 150 points total', value: 'TW Scored less than 150 points total' },
        { name: 'Missed Tw Signup', value: 'Missed Tw Signup' },
        {
          name: 'Did not meet minimum rogue actions',
          value: 'Did not meet minimum rogue actions',
        },
        { name: 'Unique Strike', value: 'Unique Strike' },
      ),
    )
    .addUserOption((option) =>
      option.setName('user5').setDescription('User you want to add strikes too').setRequired(false),
    )
    .addStringOption((option) =>
      option.setName('reason5').setDescription('reason for strike').setRequired(false).addChoices(
        { name: 'Ticket Strike', value: 'Ticket Strike' },
        { name: 'Tb Phase 1 Offense', value: 'Tb Phase 1 Offense' },
        { name: 'Tb Phase 2 Offense', value: 'Tb Phase 2 Offense' },
        { name: 'Tb Phase 3 Offense', value: 'Tb Phase 3 Offense' },
        { name: 'Tb Phase 4 Offense', value: 'Tb Phase 4 Offense' },
        { name: 'Tb Phase 5 Offense', value: 'Tb Phase 5 Offense' },
        { name: 'Tb Phase 6 Offense', value: 'Tb Phase 6 Offense' },
        { name: 'Missed Special Mission', value: 'Missed Special Mission' },
        { name: 'TW Scored less than 150 points total', value: 'TW Scored less than 150 points total' },
        { name: 'Missed Tw Signup', value: 'Missed Tw Signup' },
        {
          name: 'Did not meet minimum rogue actions',
          value: 'Did not meet minimum rogue actions',
        },
        { name: 'Unique Strike', value: 'Unique Strike' },
      ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const serverId = interaction.guild.id;
    const strikeChannel = await botDb.findOne({
      where: { Name: 'Strike Channel', ServerId: serverId },
    });
    const strike = ':x:';
    let message = '';
    const { length } = interaction.options._hoistedOptions;
    let reply = '';

    try {
      for (let i = 1; i <= length / 2; i++) {
        const user = interaction.options.getUser(`user${i}`);
        const { id, username } = user;
        const tag = `<@${id}>`;
        const reason = interaction.options.getString(`reason${i}`);

        const result = await assignStrikes(user, serverId);
        const { Strikes } = result;
        message += `- ${strike} has been added to ${tag} - ${reason}.\n   - ${username} now has ${Strikes} strikes ${strike.repeat(
          Strikes,
        )}\n\n`;
        reply += `- Strike for ${username} has been updated. ${username} now has ${Strikes} strikes\n\n`;
      }
      interaction.reply({
        content: reply,
        ephemeral: true,
      });
      interaction.guild.channels.cache.get(strikeChannel.UniqueId).send(message);
      return;
    } catch (error) {
      console.log(error);
    }
  },
};
