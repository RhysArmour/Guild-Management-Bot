import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord.js';
import { GuildUserTable } from '../../utils/database/models/guild-db';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';


export default new Command({
  name: 'removeallstrikes',
  description: 'remove all strikes from all players',
  execute: async ({ interaction }) => {
    interaction.followUp('Pong')
  }
})


// export const data = new SlashCommandBuilder()
//   .setName('removeallstrikes')
//   .setDescription('Clear all strikes from players')
//   .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

// export async function execute(interaction: any) {
//   const serverId = interaction.guild.id;

//   try {
//     const guildSearch = await GuildUserTable.findAll({
//       where: { ServerId: serverId },
//     });

//     await Promise.all(
//       guildSearch.map((member) =>
//         GuildUserTable.update({ Strikes: 0 }, { where: { id: member.id, ServerId: serverId } }),
//       ),
//     );

//     await interaction.reply('All strikes cleared');
//     return;
//   } catch (error) {
//     Logger.error(error);
//   }
// }
