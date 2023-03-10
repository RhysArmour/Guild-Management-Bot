const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const {
  channelSetup,
  awayRoleSetup,
  triggerSetup,
  threeStrikeRoleSetup,
} = require('../services/bot-setup');
const { botDb } = require('../utils/database/bot-db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setupbot')
    .setDescription(
      'sets the role you desire to be used as your "away" role for strikes to be forgiven',
    )
    .addChannelOption((channel) => {
      return channel
        .setName('ticketoffensechannel')
        .setDescription(
          'the channel where your ticket offenses are displayed (via hotbot)',
        )
        .setRequired(true);
    })
    .addChannelOption((channel) => {
      return channel
        .setName('strikechannel')
        .setDescription(
          'the channel where your strikes are assigned for public display',
        )
        .setRequired(true);
    })
    .addRoleOption((role) => {
      return role
        .setName('awayrole')
        .setDescription('the role you want to assign for those marked away')
        .setRequired(true);
    })
    .addRoleOption((role) => {
      return role
        .setName('3strikerole')
        .setDescription(
          'the role you want to assign when a user gets 3 strikes',
        )
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName('triggerphrase')
        .setDescription(
          'Trigger message from HotBot (Only include the message YOU set). Trigger will not work with urls',
        )
        .setRequired(true);
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    try {
      const channelReply = await channelSetup(interaction);
      const roleReply = await awayRoleSetup(interaction);
      const triggerReply = await triggerSetup(interaction);
      const threeStrikeRoleReply = await threeStrikeRoleSetup(interaction);
      return await interaction.reply(
        `${channelReply}\n${roleReply}\n${threeStrikeRoleReply}\n${triggerReply} \n\nBot has been successfully configured`,
      );
    } catch (error) {
      console.log(error);
    }
  },
};
