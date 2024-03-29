import { GuildMember } from 'discord.js';
import { Logger } from '../logger';
import { RoleTableService } from '../database/services/role-services';
import { MemberTableServices } from '../database/services/member-services';
import { strikeLimitReached } from './strike-limit';
import { ServerWithRelations } from '../interfaces/database/server-table-interface';

export const sortRole = async (oldMember: GuildMember, newMember: GuildMember, server: ServerWithRelations) => {
  try {
    Logger.info(`Retrieving user info for: ${oldMember.displayName} from Database`);
    const { guildRoleId, absenceRoleId, strikeLimitRoleId } = await RoleTableService.getRolesByServerId(
      oldMember.guild.id,
    );

    if (!guildRoleId || !absenceRoleId) {
      Logger.info('Bot has not been set up.');
      return;
    }

    // New Guild Role Assigned
    if (!oldMember.roles.cache.has(guildRoleId) && newMember.roles.cache.has(guildRoleId)) {
      Logger.info('New Member has been assigned guildId role');
      Logger.info(`Checking new member: ${newMember.displayName} exists in Database.`);
      const checkMemberRecord = await MemberTableServices.getMemberWithMember(oldMember);

      if (!checkMemberRecord) {
        Logger.info(`Member does not exist in Database. Skipping Updates.`);
        return;
      }
    }

    // Absent role updated
    if (
      (!oldMember.roles.cache.has(absenceRoleId) && newMember.roles.cache.has(absenceRoleId)) ||
      (oldMember.roles.cache.has(absenceRoleId) && !newMember.roles.cache.has(absenceRoleId))
    ) {
      Logger.info('Members absence status has been updated');
      Logger.info(`Checking new member: ${newMember.displayName} exists in Database.`);
      const memberRecord = await MemberTableServices.getMemberWithMember(oldMember);

      if (memberRecord) {
        Logger.info('Member exists in Database. Updating Absence status');
        await MemberTableServices.updateMembersAbsenceStatus(oldMember, newMember);
        return;
      }
      return;
    }

    // Strike Limit Role Updated
    if (!oldMember.roles.cache.has(strikeLimitRoleId) && newMember.roles.cache.has(strikeLimitRoleId)) {
      await strikeLimitReached(oldMember, server);
    }
  } catch (error) {
    Logger.error(`Error while executing sort role: ${error}`);
    throw error;
  }
};
