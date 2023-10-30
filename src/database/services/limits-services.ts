import { Logger } from '../../logger';
import prisma from '../prisma';
import { CommandInteraction } from 'discord.js';
import { IGuildLimits } from '../../interfaces/methods/bot-setup';

export class LimitsTableService {
  static async createGuildLimitsByInteraction(interaction: CommandInteraction, data: IGuildLimits) {
    try {
      const serverId = interaction.guildId as string;
      const { strikeLimit, ticketLimit } = data;
      Logger.info(`Creating guild limits for server: ${serverId}`);
      return await prisma.guildLimitsTable.create({
        data: {
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          strikeLimit,
          ticketLimit,
          server: {
            connectOrCreate: {
              where: { serverId },
              create: {
                serverId,
                serverName: interaction.guild.name,
                createdDate: new Date().toISOString(),
                updatedDate: new Date().toISOString(),
              },
            },
          },
        },
      });
    } catch (error) {
      Logger.error(`Error creating guild limits: ${error}`);
      throw new Error('Failed to create guild limits');
    }
  }

  static async updateGuildLimitsEntryByInteraction(interaction: CommandInteraction, data: IGuildLimits) {
    try {
      Logger.info(`Updating guild limits for server: ${interaction.guildId}`);
      const { strikeLimit, ticketLimit } = data;
      return await prisma.guildLimitsTable.update({
        where: { serverId: interaction.guildId },
        data: { strikeLimit, ticketLimit },
      });
    } catch (error) {
      Logger.error(`Error updating guild limits: ${error}`);
      throw new Error('Failed to update guild limits');
    }
  }

  static async deleteGuildLimitsEntryByServerId(serverId: string) {
    try {
      Logger.info(`Deleting guild limits for server: ${serverId}`);
      return await prisma.guildLimitsTable.delete({
        where: { serverId },
      });
    } catch (error) {
      Logger.error(`Error deleting guild limits: ${error}`);
      throw new Error('Failed to delete guild limits');
    }
  }

  static async getLimitsByServerId(serverId: string) {
    try {
      Logger.info(`Getting guild limits for server: ${serverId}`);
      return await prisma.guildLimitsTable.findUnique({
        where: { serverId },
      });
    } catch (error) {
      Logger.error(`Error getting guild limits: ${error}`);
      throw new Error('Failed to get guild limits');
    }
  }
}
