import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, User } from 'discord.js';
import { GuildUserTable } from '../../utils/database/models/guild-db';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';


export default new Command({
  name: 'usersearch',
  description: 'searches for registered users',
  execute: async ({ interaction }) => {
    interaction.followUp('Pong')
  }
})


// export const data = new SlashCommandBuilder()
//   .setName('usersearch')
//   .setDescription('searches for registered users')
//   .addUserOption((option) => option.setName('user').setDescription('add user you wish to search').setRequired(true));

// export async function execute(interaction: CommandInteraction) {
//   const userOption = interaction.options.getUser('user') as User;
//   const tagName = userOption.username;

//   const results = await GuildUserTable.findOne({ where: { name: tagName } });

//   if (results) {
//     return interaction.reply(`User ${results.get('name')} is registered`);
//   }

//   return interaction.reply(`Could not find User: ${tagName}. User is likely not registered`);
// }
