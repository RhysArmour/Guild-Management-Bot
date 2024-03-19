import { Logger } from '../../logger';
import prisma from '../../classes/PrismaClient';

import { GuildMember, Role } from 'discord.js';
import { RoleTableService } from './role-services';
import { LimitsTableService } from './limits-services';
import { Comlink } from '../../classes/Comlink';
import { GuildMembersTable } from '@prisma/client';
import { ServerWithRelations } from '../../interfaces/database/server-table-interface';
import { PlayerData } from '../../interfaces/comlink/playerData';

export class MemberTableServices {
  static async createMemberWithMember(
    member: GuildMember,
    playerData: PlayerData,
    allyCode: string,
  ): Promise<GuildMembersTable> {
    const serverId = member.guild.id;
    const { displayName: name } = member;

    Logger.info(`Creating member with ID: ${member.id} for server: ${member.guild.name}`);

    const result = await prisma.guildMembersTable.create({
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
        allyCode,
        playerId: playerData.playerId,
        playerName: playerData.name,
        strikes: 0,
        lifetimeStrikes: 0,
        absent: false,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
    });

    return result;
  }

  static async updateMemberWithMember(
    member: GuildMember,
    playerData: PlayerData,
    allyCode: string,
  ): Promise<GuildMembersTable> {
    const serverId = member.guild.id;
    const { displayName: name } = member;

    try {
      Logger.info(`Updating member with ID: ${member.id} for server: ${member.guild.name}`);

      const result = await prisma.guildMembersTable.update({
        where: { uniqueId: `${serverId} - ${member.id}` },
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
          allyCode,
          playerId: playerData.playerId,
          playerName: playerData.name,
          updatedDate: new Date().toISOString(),
        },
      });
      return result;
    } catch (error) {
      Logger.error(error);
    }
  }

  static async addMemberStrikesWithMember(member: GuildMember, strikeValue: number) {
    Logger.info(`Adding Strikes to member: ${member.id} for server: ${member.guild.name}`);
    const existingRecord = await this.getMemberWithMember(member);

    const record = await prisma.guildMembersTable.update({
      where: { uniqueId: `${member.guild.id} - ${member.id}` },
      data: {
        strikes: existingRecord!.strikes + strikeValue,
        lifetimeStrikes: existingRecord!.lifetimeStrikes + strikeValue,
      },
    });

    const { strikeLimit } = await LimitsTableService.getLimitsByServerId(member.guild.id);

    if (record.strikes >= strikeLimit) {
      Logger.info(`${member.displayName} reached strike limit. Adding strike limit role.`);
      const { strikeLimitRoleId } = await RoleTableService.getRolesByServerId(member.guild.id);
      const role = (await member.guild.roles.fetch(`${strikeLimitRoleId}`)) as Role;
      member.roles.add(role);
    }
    return record;
  }

  static async updateMemberStrikesByGuildMember(member: GuildMember, strikeValue: number) {
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

  static async updateMembersAbsenceStatus(oldMember: GuildMember, newMember: GuildMember) {
    Logger.info(`Updating ${oldMember.displayName} Absence status.`);
    const serverId = oldMember.guild.id;
    const { absenceRoleId } = await RoleTableService.getRolesByServerId(serverId);
    let currentAbsenceStartDate: null | string = null;
    let totalAbsenceDuration: null | number = null;
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

  static async getMemberWithMember(member: GuildMember) {
    Logger.info(`Fetching member with name: ${member.displayName} for server: ${member.guild.name}`);
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

  static async getAllMembersDataByServerId(serverId: string) {
    Logger.info(`Fetching all members in server: ID: ${serverId}`);
    return prisma.guildMembersTable.findMany({
      where: { serverId },
      include: {
        strikeReasons: true,
      },
    });
  }

  static async strikeResetUpdate(uniqueId: string, newStrikes: number) {
    await prisma.guildMembersTable.update({
      where: { uniqueId },
      data: {
        strikes: newStrikes,
      },
    });
  }

  static async removeAllStrikesUpdate(member: GuildMembersTable, totalStrikesToRemove: number) {
    await prisma.guildMembersTable.update({
      where: { uniqueId: member.uniqueId },
      data: {
        strikes: member.strikes - totalStrikesToRemove,
        lifetimeStrikes: member.lifetimeStrikes - totalStrikesToRemove,
      },
    });
  }

  static async getMembersWithLessThanTicketLimit(server: ServerWithRelations) {
    const memberTickets = await Comlink.getGuildTickets(server.guildId);
    const result = memberTickets.filter((member) => member.tickets < server.limits.ticketLimit);
    return result;
  }
}
