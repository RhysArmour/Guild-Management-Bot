import { GuildMember, TextChannel } from 'discord.js';
import { Logger } from '../logger';
import { strikeLimitReached } from './strike-limit';
import { Server } from '../../db/models';
import { RoleRepository } from '../database/repositories/roles-repository';
import { MemberRepository } from '../database/repositories/member-repository';

export const sortRole = async (oldMember: GuildMember, newMember: GuildMember, server: Server) => {
  try {
    Logger.info(`Retrieving user info for: ${oldMember.displayName} from Database`);
    const { guildRoleId, absenceRoleId, strikeLimitRoleId } = await new RoleRepository().getRoles(oldMember.guild.id);

    if (!guildRoleId || !absenceRoleId) {
      Logger.info('Bot has not been set up.');
      return;
    }

    // New Guild Role Assigned
    if (!oldMember.roles.cache.has(guildRoleId) && newMember.roles.cache.has(guildRoleId)) {
      Logger.info('New Member has been assigned guildId role');
      Logger.info(`Checking new member: ${newMember.displayName} exists in Database.`);
      const checkMemberRecord = await new MemberRepository().findServerMember(server.serverId, oldMember.id);

      if (!checkMemberRecord) {
        Logger.info(`Member does not exist in Database. Sending registration message.`);
        const { notificationChannelId, notificationChannelName } = server.channels;
        const notificationChannel = newMember.client.channels.cache.get(notificationChannelId) as TextChannel;
        if (notificationChannel) {
          const message = `New member ${newMember.displayName} has been assigned the guild role. Please register using the command \`/register allyCode:\`.`;
          await notificationChannel.send(message);
        } else {
          Logger.error(`Notification channel ${notificationChannelName} not found or is not a text channel.`);
        }
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
      const memberRecord = await new MemberRepository().findServerMember(server.serverId, oldMember.id);

      if (memberRecord) {
        Logger.info('Member exists in Database. Updating Absence status');
        const isAbsent = newMember.roles.cache.has(absenceRoleId);
        await new MemberRepository().updateAbsenceStatus(memberRecord, isAbsent);
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
