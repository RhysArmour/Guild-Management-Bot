import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildUserTable } from '../../utils/database/models/guild-db';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';


export default new Command({
  name: 'checkstrikes',
  description: 'Check strikes for one member',
  execute: async ({ interaction }) => {
    interaction.followUp('Pong')
  }
})

// export const data = new SlashCommandBuilder()
//   .setName('checkstrikes')
//   .setDescription('Check strikes for one member')
//   .addUserOption((option) => option.setName('user').setDescription('User you want to clear strikes from'));

// export async function execute(interaction: any) {
//   try {
//     const user = interaction.options.getUser('user');
//     const name = user.username;
//     const serverId = interaction.guild.id;
//     const result = await GuildUserTable.findOne({
//       where: { Name: name, UniqueId: user.id, ServerId: serverId },
//     });

//     if (result === null) {
//       return interaction.reply(
//         'Player is not registered with Bot. This is because they have not attained any strikes or have not been registered manually',
//       );
//     }

//     const strikes = result.strikes;
//     const totalStrikes = result.lifetimeStrikes;

//     await interaction.reply(`${name} has ${strikes} strikes this month and ${totalStrikes} lifetime strikes`);

//     return;
//   } catch (error) {
//     Logger.error(error);
//   }
// }
