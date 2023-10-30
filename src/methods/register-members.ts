import { CommandInteraction } from 'discord.js';
import { RoleTableService } from '../database/services/role-services';
import { MemberTableServices } from '../database/services/member-services';
import { Logger } from '../logger';

const processMember = async (member, guildRoleId) => {
  const existingMember = await MemberTableServices.getMemberWithMember(member);

  if (!existingMember && member.roles.cache.has(guildRoleId)) {
    await MemberTableServices.createMemberWithMember(member);
    Logger.info(`Created member ${member.displayName}`);
    return {
      action: 'created',
      displayName: member.displayName,
    };
  } else if (existingMember && !member.roles.cache.has(guildRoleId)) {
    await MemberTableServices.deleteMemberWithMember(member);
    Logger.info(`Deleted member ${member.displayName}`);
    return {
      action: 'deleted',
      displayName: member.displayName,
    };
  }
  return null;
};

export const registerMembers = async (interaction: CommandInteraction) => {
  try {
    const { guildRoleId } = await RoleTableService.getRolesByServerId(interaction.guildId);
    const members = await interaction.guild.members.fetch();
    
    const actions = await Promise.all(members.map((member) => processMember(member, guildRoleId)));
    const newMembers = actions.filter((action) => action?.action === 'created').map((action) => action.displayName);
    const deletedMembers = actions.filter((action) => action?.action === 'deleted').map((action) => action.displayName);

    Logger.info('Successfully registered members');
    return {
      message: 'Successfully registered members',
      content: {
        newMembers,
        deletedMembers,
      },
    };
  } catch (error) {
    Logger.error(`Error in registerMembers: ${error}`);
    throw new Error('Failed to register members');
  }
};
