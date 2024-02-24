import { IGuildServer } from '../../interfaces/methods/bot-setup';
import { Logger } from '../../logger';
import prisma from '../../classes/PrismaClient';
import { CommandInteraction } from 'discord.js';

export class ServerTableService {
  static async createServerTableEntryByInteraction(interaction: CommandInteraction) {
    try {
      const serverId = interaction.guildId;
      const serverName = interaction.guild.name;

      const newServer = await prisma.serverTable.create({
        data: {
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          serverId,
          serverName,
        },
      });

      Logger.info(`Created server entry for server: ${serverName}`);
      return newServer;
    } catch (error) {
      Logger.error(`Error creating server entry: ${error}`);
      throw new Error('Failed to create server entry');
    }
  }

  static async createServerTableEntryByInteractionWithData(interaction: CommandInteraction, serverData: IGuildServer) {
    try {
      const { triggerPhrase, strikeResetPeriod } = serverData;
      const strikeResetPeriodValue = strikeResetPeriod ? strikeResetPeriod : 1;
      const serverId = interaction.guildId;
      const serverName = interaction.guild.name;

      const newServer = await prisma.serverTable.create({
        data: {
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          triggerPhrase,
          strikeResetPeriod: strikeResetPeriodValue,
          serverId,
          serverName,
        },
      });

      Logger.info(`Created server entry for server: ${serverName}`);
      return newServer;
    } catch (error) {
      Logger.error(`Error creating server entry: ${error}`);
      throw new Error('Failed to create server entry');
    }
  }

  static async updateServerTableEntryByInteraction(interaction: CommandInteraction, serverData: IGuildServer) {
    try {
      const serverId = interaction.guildId;
      const existingRecord = await this.getServerTableByServerId(serverId);

      let { triggerPhrase, strikeResetPeriod } = serverData;

      if (!triggerPhrase) {
        triggerPhrase = existingRecord.triggerPhrase;
      }

      if (!strikeResetPeriod) {
        strikeResetPeriod = existingRecord.strikeResetPeriod;
      }

      const updatedServer = await prisma.serverTable.update({
        where: { serverId },
        data: {
          triggerPhrase,
          strikeResetPeriod,
        },
      });

      Logger.info(`Updated server entry for server: ${existingRecord.serverName}`);
      return updatedServer;
    } catch (error) {
      Logger.error(`Error updating server entry: ${error}`);
      throw new Error('Failed to update server entry');
    }
  }

  static async deleteServerTableEntry(serverId: string) {
    try {
      const serverRecord = await this.getServerTableByServerId(serverId);

      if (serverRecord) {
        const deletedServer = await prisma.serverTable.delete({
          where: { serverId },
        });

        Logger.info(`Deleted server entry for server: ${serverRecord.serverName}`);
        return deletedServer;
      } else {
        Logger.warn(`Server entry not found for server with ID: ${serverId}`);
        return null;
      }
    } catch (error) {
      Logger.error(`Error deleting server entry: ${error}`);
      throw new Error('Failed to delete server entry');
    }
  }

  static async getServerTableByServerId(serverId: string) {
    try {
      const serverRecord = await prisma.serverTable.findUnique({
        where: { serverId },
      });

      if (serverRecord) {
        Logger.info(`Retrieved server entry for server: ${serverRecord.serverName}`);
      }

      return serverRecord;
    } catch (error) {
      Logger.error(`Error getting server entry: ${error}`);
      return;
    }
  }

  static async getAllStrikeValuesByServerId(serverId: string) {
    try {
      const { guildStrikes } = await prisma.serverTable.findUnique({
        where: { serverId },
        include: {
          guildStrikes: true,
        },
      });

      if (guildStrikes) {
        Logger.info(`Retrieved server entry for server: ${serverId}`);
      } else {
        Logger.warn(`No custom Guild Strike entries found for server with ID: ${serverId}`);
      }

      return guildStrikes;
    } catch (error) {
      Logger.error(`Error getting server entry: ${error}`);
      throw new Error('Failed to get server entry');
    }
  }

  static async updateLastStrikeResetEntryByServerId(serverId: string) {
    try {
      const date = new Date();
      let lastStrikeReset: Date;
      if (date.getMonth() === 0) {
        lastStrikeReset = new Date(date.getFullYear() - 1, date.getMonth() + 11, 1);
      } else {
        lastStrikeReset = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      }
      await prisma.serverTable.update({
        where: { serverId },
        data: {
          lastStrikeReset,
        },
      });
    } catch (error) {
      Logger.error(`Error while updating last strike reset ${error}`);
      throw error;
    }
  }
}
