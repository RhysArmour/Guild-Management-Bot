import { CommandInteraction } from 'discord.js';
import { RoleTableService } from '../database/services/role-services';
import { MemberTableServices } from '../database/services/member-services';
import { Logger } from '../logger';

const processedMembers = [];

const processMember = async (member, guildRoleId) => {
  try {
    const existingMember = await MemberTableServices.getMemberWithMember(member);
    processedMembers.push(member.displayName);

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
    return {
      action: 'No Action',
      displayName: member.displayName,
    };
  } catch (error) {
    Logger.error(`Error processing Members: ${error}`);
  }
};

export const registerMembers = async (interaction: CommandInteraction) => {
  try {
    const { guildRoleId } = await RoleTableService.getRolesByServerId(interaction.guildId);
    const members = await interaction.guild.members.fetch();
    const realMembers = members.filter((member) => !member.user.bot);

    const actions = await Promise.all(realMembers.map((member) => processMember(member, guildRoleId)));
    const newMembers = actions.filter((action) => action?.action === 'created').map((action) => action.displayName);
    const deletedMembers = actions.filter((action) => action?.action === 'deleted').map((action) => action.displayName);

    const fetchRegisteredMembers = await MemberTableServices.getAllMembersByServerId(interaction.guildId);

    const registeredMembers = fetchRegisteredMembers.map((member) => member.name);

    const unProcessedRegisteredMembers = registeredMembers.filter((member) => !processedMembers.includes(member));

    if (unProcessedRegisteredMembers) {
      Logger.info('Deleting Members who have left the server.');
      unProcessedRegisteredMembers.forEach(async (member) => {
        await MemberTableServices.deleteMemberWithServerIdAndDisplayName(interaction.guildId, member);
        deletedMembers.push(member);
      });
    }

    const newMemberResponse = newMembers.length > 0 ? `New Members Registered:\n${newMembers.join('\n')}\n` : '';
    const deletedMembersResponse =
      deletedMembers.length > 0
        ? `Members Unregistered due to no longer being in the guild:\n${deletedMembers.join('\n')}\n`
        : '';
    const formattedResponse =
      newMemberResponse + deletedMembersResponse || 'Command executed successfully but there were no updates.';

    Logger.info('Successfully registered members');
    return {
      message: formattedResponse,
      content: undefined,
    };
  } catch (error) {
    Logger.error(`Error in registerMembers: ${error}`);
    throw new Error('Failed to register members');
  }
};
