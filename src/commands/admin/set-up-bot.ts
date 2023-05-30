import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord.js';
import { channelSetup, awayRoleSetup, triggerSetup, threeStrikeRoleSetup } from '../../services/bot-setup';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';


export default new Command({
  name: 'botsetup',
  description: 'sets the role you desire to be used as your "away" role for strikes to be forgiven',
  execute: async ({ interaction }) => {
    interaction.followUp('Pong')
  }
})


// export const data = new SlashCommandBuilder()
//   .setName('setupbot')
//   .setDescription('sets the role you desire to be used as your "away" role for strikes to be forgiven')
//   .addChannelOption((channel) =>
//     channel
//       .setName('ticketoffensechannel')
//       .setDescription('the channel where your ticket offenses are displayed (via hotbot)')
//       .setRequired(true),
//   )
//   .addChannelOption((channel) =>
//     channel
//       .setName('strikechannel')
//       .setDescription('the channel where your strikes are assigned for public display')
//       .setRequired(true),
//   )
//   .addRoleOption((role) =>
//     role.setName('awayrole').setDescription('the role you want to assign for those marked away').setRequired(true),
//   )
//   .addRoleOption((role) =>
//     role
//       .setName('3strikerole')
//       .setDescription('the role you want to assign when a user gets 3 strikes')
//       .setRequired(true),
//   )
//   .addStringOption((option) =>
//     option
//       .setName('triggerphrase')
//       .setDescription('Trigger message from HotBot (Only include the message YOU set). Trigger will not work with urls')
//       .setRequired(true),
//   )
//   .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

// export async function execute(interaction: any) {
//   try {
//     const channelReply = await channelSetup(interaction);
//     const roleReply = await awayRoleSetup(interaction);
//     const triggerReply = await triggerSetup(interaction);
//     const threeStrikeRoleReply = await threeStrikeRoleSetup(interaction);
//     return await interaction.reply(
//       `${channelReply}\n${roleReply}\n${threeStrikeRoleReply}\n${triggerReply} \n\nBot has been successfully configured`,
//     );
//   } catch (error) {
//     Logger.error(error);
//   }
// }
