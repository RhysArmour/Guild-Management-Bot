import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { MemberTableServices } from '../database/services/member-services';
import { Logger } from '../logger';
import { ServerWithRelations } from '../interfaces/database/server-table-interface';
import { Comlink } from '../classes/Comlink';

export const registerMembers = async (interaction: ChatInputCommandInteraction, server: ServerWithRelations) => {
  try {
    await interaction.guild.members.fetch();
    const allyCode = interaction.options.getString('allycode');
    let member = interaction.options.getMember('member') as GuildMember;

    if (!member) {
      member = interaction.member as GuildMember;
    }

    const playerData = await Comlink.getPlayerByAllyCode(allyCode);

    const existingMember = server.members.find((entry) => entry.memberId === member.user.id);

    if (existingMember) {
      Logger.info(`Member is already registered to ${existingMember.serverName}. Updating Record.`);
      await MemberTableServices.updateMemberWithMember(member, playerData, allyCode);
      return `Member was already registered to ${existingMember.serverName}. Updated Records.`;
    } else {
      const newMember = await MemberTableServices.createMemberWithMember(member, playerData, allyCode);
      return `${member.displayName} registered to ${allyCode} in ${newMember.serverName}.`;
    }
  } catch (error) {
    Logger.error(`Error in registerMembers: ${error}`);
    throw new Error('Failed to register members');
  }
};
