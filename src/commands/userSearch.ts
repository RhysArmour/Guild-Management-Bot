import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, User } from 'discord.js';
import { GuildUserTable } from '../utils/database/models/guild-db';

export default {
  data: new SlashCommandBuilder()
    .setName('usersearch')
    .setDescription('searches for registered users')
    .addUserOption((option) => option.setName('user').setDescription('add user you wish to search').setRequired(true)),

  async execute(interaction: CommandInteraction) {
    const userOption = interaction.options.getUser('user') as User;
    const tagName = userOption.username;

    const results = await GuildUserTable.findOne({ where: { name: tagName } });

    if (results) {
      return interaction.reply(`User ${results.get('name')} is registered`);
    }

    return interaction.reply(`Could not find User: ${tagName}. User is likely not registered`);
  },
};
