import { Logger } from '../../logger';
import prisma from '../prisma';
import { GuildMember } from 'discord.js';
import { IStrikeReasons } from '../../interfaces/database/strike-reason';
import { MemberStrikeReasons, Prisma } from '@prisma/client';
import { ServerTableService } from './server-services';

export class StrikeReasonsServices {
  static async filterStrikeByResetPeriod(
    strikeReasons: MemberStrikeReasons[],
    serverId: string,
  ): Promise<MemberStrikeReasons[]> {
    Logger.info('Starting filterStrikeByResetPeriod method');
    let { strikeResetPeriod, lastStrikeReset } = await ServerTableService.getServerTableByServerId(serverId);
    const newDate = new Date();
    if (!lastStrikeReset) {
      lastStrikeReset = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    }
    if (!strikeResetPeriod) {
      strikeResetPeriod = 1;
    }
    const result: MemberStrikeReasons[] = [];
    newDate.setMonth(lastStrikeReset.getMonth() + strikeResetPeriod);

    strikeReasons.forEach((entry) => {
      if (entry.date.getTime() - lastStrikeReset.getTime() < newDate.getTime() - lastStrikeReset.getTime()) {
        result.push(entry);
      }
    });

    return result;
  }

  static async createStrikeReasonByMember(member: GuildMember, data: IStrikeReasons) {
    try {
      Logger.info('Starting createStrikeReasonByMember method');
      const serverId = member.guild.id;
      const { name, id, reason } = data;
      const uniqueId = `${serverId} - ${id}`;

      const newReason = await prisma.memberStrikeReasons.create({
        data: {
          date: new Date().toISOString(),
          serverId,
          name,
          reason,
          member: {
            connectOrCreate: {
              where: { uniqueId },
              create: {
                name,
                uniqueId,
                serverName: member.guild.name,
                memberId: id,
                strikes: 0,
                lifetimeStrikes: 0,
                absent: false,
                createdDate: new Date().toISOString(),
                updatedDate: new Date().toISOString(),
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
              },
            },
          },
        },
      });

      Logger.info(`Created strike reason entry for member ${name} on server ${member.guild.name}`);
      return newReason;
    } catch (error) {
      Logger.error(`Error creating strike reason entry: ${error}`);
      throw new Error('Failed to create strike reason entry');
    }
  }

  static async deleteStrikeReasonEntryByMember(
    member: GuildMember,
    unique_reason: Prisma.MemberStrikeReasonsUnique_reasonCompoundUniqueInput,
  ) {
    try {
      Logger.info('Starting deleteStrikeReasonEntryByMember method');

      const deletedReason = await prisma.memberStrikeReasons.delete({
        where: { unique_reason },
      });

      Logger.info(`Deleted strike reason entry for member ${member.id} on server ${member.guild.name}`);
      return deletedReason;
    } catch (error) {
      Logger.error(`Error deleting strike reason entry: ${error}`);
      throw Error('Failed to delete strike reason entry');
    }
  }

  static async deleteManyStrikeReasonEntriesByServerId(serverId: string) {
    try {
      Logger.info('Starting deleteManyStrikeReasonEntriesByServerId method');
      const date = new Date();

      const deletedReason = await prisma.memberStrikeReasons.deleteMany({
        where: {
          serverId,
          date: {
            gte: new Date(date.getFullYear(), date.getMonth(), 1),
            lte: new Date(date.getFullYear(), date.getMonth() + 1, 0),
          },
        },
      });

      Logger.info(`Deleted all strike reason entries for server Id: ${serverId} for ${date.getMonth()}`);
      return deletedReason;
    } catch (error) {
      Logger.error(`Error deleting all strike reason entries: ${error}`);
      throw Error('Failed to delete all strike reason entries');
    }
  }

  static async updateStrikeReasonEntryByMember(member: GuildMember, data: IStrikeReasons) {
    try {
      Logger.info('Starting updateStrikeReasonEntryByMember method');
      const serverId = member.guild.id;
      const { id, date, reason } = data;
      const unique_reason = {
        uniqueId: `${serverId} - ${id}`,
        date,
        reason,
      };

      const updatedReason = await prisma.memberStrikeReasons.update({
        where: { unique_reason },
        data: {
          uniqueId: unique_reason.uniqueId,
          date,
          reason,
        },
      });

      Logger.info(`Updated strike reason entry for member ${id} on server ${member.guild.name}`);
      return updatedReason;
    } catch (error) {
      Logger.error(`Error updating strike reason entry: ${error}`);
      throw new Error('Failed to update strike reason entry');
    }
  }

  static async getStrikeReasonByMember(member: GuildMember, data: IStrikeReasons) {
    try {
      Logger.info('Starting getStrikeReasonByMember method');
      const serverId = member.guild.id;
      const { id, date, reason } = data;
      const unique_reason = {
        uniqueId: `${serverId} - ${id}`,
        date,
        reason,
      };

      const reasonEntry = await prisma.memberStrikeReasons.findUnique({
        where: { unique_reason },
      });

      if (reasonEntry) {
        Logger.info(`Retrieved strike reason entry for member ${id} on server ${member.guild.name}`);
      } else {
        Logger.warn(`Strike reason entry not found for member ${id} on server ${member.guild.name}`);
      }

      return reasonEntry;
    } catch (error) {
      Logger.error(`Error getting strike reason entry: ${error}`);
      throw new Error('Failed to get strike reason entry');
    }
  }

  static async getManyStrikeReasonsByMemberWithinResetPeriod(member: GuildMember, reason: string) {
    try {
      Logger.info('Starting getManyStrikeReasonsByMemberWithinResetPeriod method');
      const serverId = member.guild.id;
      const uniqueId = `${serverId} - ${member.id}`;

      const reasonEntries = await prisma.memberStrikeReasons.findMany({
        where: { uniqueId, reason },
      });
      if (reasonEntries) {
        Logger.info(`Retrieved strike reason entries for member ${member.id} on server ${member.guild.name}`);
      } else {
        Logger.warn(`Strike reason entries not found for member ${member.id} on server ${member.guild.name}`);
      }

      const result = this.filterStrikeByResetPeriod(reasonEntries, serverId);

      return result;
    } catch (error) {
      Logger.error(`Error getting strike reason entry: ${error}`);
      throw new Error('Failed to get strike reason entry');
    }
  }
}
