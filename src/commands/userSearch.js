const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildDb } = require("../utils/database/guild-db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('usersearch')
    .setDescription('searches for registered users')
    .addUserOption((option) => option.setName('user').setDescription('add user you wish to search').setRequired(true)),

  async execute(interaction) {
    // eslint-disable-next-line no-underscore-dangle
    const tagName = interaction.options._hoistedOptions[0].user.username;

    const results = await guildDb.findOne({ where: { name: tagName } });

    if (results) {
      return interaction.reply(`User ${results.get('name')} is registered`);
    }

    return interaction.reply(`Could not find User: ${tagName}. User is likely not registered`);
  },
};
