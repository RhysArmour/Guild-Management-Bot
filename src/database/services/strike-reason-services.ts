import { Logger } from '../../logger';
import prisma from '../../classes/PrismaClient';
import { GuildMember } from 'discord.js';
import { GuildStrikeValues, MemberStrikeReasons, Prisma } from '@prisma/client';
import { getLastMonthFullDate } from '../../utils/helpers/get-date';
import { ServerWithRelations } from '../../interfaces/database/server-table-interface';
import { ServerTableService } from './server-services';

export class StrikeReasonsServices {
  static async filterStrikeByResetPeriod(
    strikeReasons: MemberStrikeReasons[],
    server: ServerWithRelations,
  ): Promise<MemberStrikeReasons[]> {
    Logger.info('Starting filterStrikeByResetPeriod method.');
    let { strikeResetPeriod, lastStrikeReset } = server;
    const newDate = new Date();
    if (!lastStrikeReset) {
      lastStrikeReset = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    }
    if (!strikeResetPeriod) {
      strikeResetPeriod = 1;
    }
    const result: MemberStrikeReasons[] = [];

    strikeReasons.forEach((entry) => {
      if (entry.date.getMonth() === newDate.getMonth()) {
        result.push(entry);
      }
    });

    return result;
  }

  static async createStrikeReasonByMember(member: GuildMember, reason: string) {
    try {
      Logger.info('Starting createStrikeReasonByMember method');
      const serverId = member.guild.id;
      const { displayName, id } = member;
      const uniqueId = `${serverId} - ${id}`;

      const newReason = await prisma.memberStrikeReasons.create({
        data: {
          date: new Date().toISOString(),
          serverId,
          name: displayName,
          reason,
          member: {
            connectOrCreate: {
              where: { uniqueId },
              create: {
                name: displayName,
                username: member.user.username,
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

      Logger.info(`Created strike reason entry for member ${displayName} on server ${member.guild.name}`);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async strikeReasonsReset(serverId: string, startOfPreviousMonthDate: any, endOfPreviousMonthDate: any) {
    try {
      Logger.info('Starting deleteManyStrikeReasonEntriesByServerId method');
      const lastMonth = getLastMonthFullDate();

      await prisma.memberStrikeReasons.deleteMany({
        where: {
          serverId,
          date: {
            lte: endOfPreviousMonthDate,
            gte: startOfPreviousMonthDate,
          },
        },
      });

      Logger.info(
        `Deleted all strike reason entries for server Id: ${serverId} for ${lastMonth.toLocaleString('default', {
          month: 'long',
        })}`,
      );
    } catch (error) {
      Logger.error(`Error deleting all strike reason entries: ${error}`);
      throw Error('Failed to delete all strike reason entries');
    }
  }

  static async getManyStrikeReasonsByMemberWithinResetPeriod(member: GuildMember, reason: string) {
    try {
      Logger.info('Starting getManyStrikeReasonsByMemberWithinResetPeriod method');
      const server = await ServerTableService.getServerTableByServerId(member.guild.id);
      const uniqueId = `${server.serverId} - ${member.id}`;

      const reasonEntries = await prisma.memberStrikeReasons.findMany({
        where: { uniqueId, reason },
      });
      if (reasonEntries) {
        Logger.info(`Retrieved strike reason entries for member ${member.id} on server ${member.guild.name}`);
      } else {
        Logger.warn(`Strike reason entries not found for member ${member.id} on server ${member.guild.name}`);
      }

      const result = this.filterStrikeByResetPeriod(reasonEntries, server);

      return result;
    } catch (error) {
      Logger.error(`Error getting strike reason entry: ${error}`);
      throw new Error('Failed to get strike reason entry');
    }
  }

  static async getTicketStrikesByMemberWithinResetPeriod(member: GuildMember) {
    try {
      Logger.info('Starting getTicketStrikesByMemberWithinResetPeriod method');
      const server = await ServerTableService.getServerTableByServerId(member.guild.id);
      const uniqueId = `${server.serverId} - ${member.id}`;

      const reasonEntries = await prisma.memberStrikeReasons.findMany({
        where: {
          uniqueId,
          reason: {
            startsWith: 'Ticket Strike',
          },
        },
      });
      if (reasonEntries) {
        Logger.info(`Retrieved strike reason entries for member ${member.id} on server ${member.guild.name}`);
      } else {
        Logger.warn(`Strike reason entries not found for member ${member.id} on server ${member.guild.name}`);
      }

      const result = this.filterStrikeByResetPeriod(reasonEntries, server);

      return result;
    } catch (error) {
      Logger.error(`Error getting strike reason entry: ${error}`);
      throw new Error('Failed to get strike reason entry');
    }
  }

  static async getReasonsList(filteredReasons: MemberStrikeReasons[], guildStrikeValuesRecord: GuildStrikeValues[]) {
    let reasonList = '';
    const strike = ':x:';
    const reasonValues = guildStrikeValuesRecord.reduce((result, record) => {
      result[record.strikeReason] = record.value;
      return result;
    }, {});

    let j = 0;
    filteredReasons.forEach((entry) => {
      j++;
      const strikeDate = new Date(entry.date);
      const date = strikeDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

      if (entry.reason in reasonValues) {
        reasonList =
          reasonList + `${j}. ${date}: ${entry.reason} - ${strike.repeat(reasonValues[`${entry.reason}`])}\n`;
      } else {
        reasonList = reasonList + `${j}. ${date}: ${entry.reason} - :x:\n`;
      }
    });
    return reasonList;
  }
}
