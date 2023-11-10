import { Logger } from '../../logger';
import prisma from '../prisma';

import { CommandInteraction, GuildMember } from 'discord.js';
import { RoleTableService } from './role-services';
import { LimitsTableService } from './limits-services';

export class MemberTableServices {
  static async createMemberWithMember(member: GuildMember) {
    const serverId = member.guild.id;
    const { displayName: name } = member;

    Logger.info(`Creating member with ID: ${member.id} for server: ${member.guild.name}`);
    return prisma.guildMembersTable.create({
      data: {
        uniqueId: `${serverId} - ${member.id}`,
        serverName: member.guild.name,
        server: {
          connectOrCreate: {
            where: { serverId },
            create: {
              serverId,
              serverName: member.guild.name,
              createdDate: new Date().toISOString(),
              updatedDate: new Date().toISOString(),
            },
          },
        },
        memberId: member.id,
        name,
        username: member.user.username,
        strikes: 0,
        lifetimeStrikes: 0,
        absent: false,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
    });
  }

  static async addMemberStrikesWithMember(member: GuildMember, strikeValue: number) {
    Logger.info(`Adding Strikes to member: ${member.id} for server: ${member.guild.name}`);
    const existingRecord = await this.getMemberWithMember(member);

    const record = await prisma.guildMembersTable.update({
      where: { uniqueId: `${member.guild.id} - ${member.id}` },
      data: {
        strikes: existingRecord.strikes + strikeValue,
        lifetimeStrikes: existingRecord.lifetimeStrikes + strikeValue,
      },
    });

    const { strikeLimit } = await LimitsTableService.getLimitsByServerId(member.guild.id);

    if (record.strikes >= strikeLimit) {
      Logger.info(`${member.displayName} reached strike limit. Adding strike limit role.`);
      const { strikeLimitRoleId } = await RoleTableService.getRolesByServerId(member.guild.id);
      const role = await member.guild.roles.fetch(`${strikeLimitRoleId}`);
      member.roles.add(role);
    }
    return record;
  }

  static async updateAllStrikesWithServerId(serverId: string) {
    Logger.info(`Updating server with ID: ${serverId}`);
    return prisma.guildMembersTable.updateMany({
      where: { serverId },
      data: {
        strikes: 0,
      },
    });
  }

  static async updateMemberStrikesByMember(member: GuildMember, strikeValue: number) {
    Logger.info(`Updating member with ID: ${member.id} for server: ${member.guild.name}`);
    const existingRecord = await this.getMemberWithMember(member);
    return prisma.guildMembersTable.update({
      where: { uniqueId: `${member.guild.id} - ${member.id}` },
      data: {
        strikes: existingRecord.strikes - strikeValue,
        lifetimeStrikes: existingRecord.lifetimeStrikes - strikeValue,
      },
    });
  }

  static async updateMemberUsername(member: GuildMember) {
    Logger.info(`Updating member with ID: ${member.id} for server: ${member.guild.name}`);
    return prisma.guildMembersTable.update({
      where: { uniqueId: `${member.guild.id} - ${member.id}` },
      data: {
        username: member.user.username,
      },
    });
  }

  static async updateMembersAbsenceStatus(oldMember: GuildMember, newMember: GuildMember) {
    Logger.info(`Updating ${oldMember.displayName} Absence status.`);
    const serverId = oldMember.guild.id;
    const { absenceRoleId } = await RoleTableService.getRolesByServerId(serverId);
    let currentAbsenceStartDate = null;
    let totalAbsenceDuration = null;
    const currentRecord = await MemberTableServices.getMemberWithMember(oldMember);
    const date = new Date();

    if (newMember.roles.cache.has(absenceRoleId)) {
      Logger.info(`${oldMember.displayName} is going absent`);
      currentAbsenceStartDate = new Date().toISOString();
      if (!currentRecord.totalAbsenceDuration) {
        Logger.info(`${oldMember.displayName} is going absent for the first time`);
        totalAbsenceDuration = 0;
      }
    } else {
      Logger.info(`${oldMember.displayName} is removing absent status`);
      currentAbsenceStartDate = null;
      if (currentRecord.totalAbsenceDuration === 0) {
        Logger.info(`${oldMember.displayName} is removing absent status for the first time`);
        totalAbsenceDuration = (date.getTime() - currentRecord.currentAbsenceStartDate.getTime()) / (1000 * 3600 * 24);
      } else {
        Logger.info(`Calculating total absence duration`);
        if (!currentRecord.currentAbsenceStartDate) {
          totalAbsenceDuration =
            (currentRecord.totalAbsenceDuration + (date.getTime() - currentRecord.currentAbsenceStartDate.getTime())) /
            (1000 * 3600 * 24);
        }
      }
    }

    Logger.info(`Updating member with ID: ${oldMember.id} for server: ${oldMember.guild.name}`);
    return prisma.guildMembersTable.update({
      where: { uniqueId: `${serverId} - ${oldMember.id}` },
      data: {
        uniqueId: `${newMember.guild.id} - ${newMember.id}`,
        serverName: newMember.guild.name,
        memberId: newMember.id,
        name: newMember.displayName,
        absent: newMember.roles.cache.has(absenceRoleId),
        currentAbsenceStartDate,
        totalAbsenceDuration,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
    });
  }

  static async deleteMemberWithMember(member: GuildMember) {
    Logger.info(`Deleting member with ID: ${member.id} for server: ${member.guild.name}`);
    return prisma.guildMembersTable.delete({
      where: { uniqueId: `${member.guild.id} - ${member.id}` },
    });
  }

  static async getMemberWithMember(member: GuildMember) {
    Logger.info(`Fetching member with ID: ${member.id} for server: ${member.guild.name}`);
    return prisma.guildMembersTable.findUnique({
      where: { uniqueId: `${member.guild.id} - ${member.id}` },
    });
  }

  static async getAllStrikeReasonsByMember(member: GuildMember) {
    Logger.info(`Fetching member with ID: ${member.id} for server: ${member.guild.name}`);
    return prisma.guildMembersTable.findUnique({
      where: { uniqueId: `${member.guild.id} - ${member.id}` },
      include: {
        strikeReasons: true,
      },
    });
  }

  static async getAllGuildStrikesByInteraction(interaction: CommandInteraction) {
    Logger.info(`Fetching all members in server: ID: ${interaction.guild.id} for server: ${interaction.guild.name}`);
    return prisma.guildMembersTable.findMany({
      where: { serverId: interaction.guild.id },
      select: {
        name: true,
        strikes: true,
        lifetimeStrikes: true,
      },
    });
  }

  static async getAllMembersByServerId(serverId: string) {
    Logger.info(`Fetching all members in server: ID: ${serverId}`);
    return prisma.guildMembersTable.findMany({
      where: { serverId },
      select: {
        name: true,
      },
    });
  }
}
