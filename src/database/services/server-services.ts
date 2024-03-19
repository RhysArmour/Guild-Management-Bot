import { IGuildServer } from '../../interfaces/methods/bot-setup';
import { Logger } from '../../logger';
import prisma from '../../classes/PrismaClient';
import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import { ServerWithRelations } from '../../interfaces/database/server-table-interface';
import { Comlink } from '../../classes/Comlink';

export class ServerTableService {
  private static async getGameData(allyCode: string) {
    Logger.info('Getting Player Data.');
    const playerData = await Comlink.getPlayerByAllyCode(allyCode);
    Logger.info('Getting Guild Info.');
    const guildData = await Comlink.getGuildInfoByGuildId(playerData.guildId);
    return {
      playerData,
      guildData,
    };
  }

  static async createServerTableEntryByInteractionWithData(interaction: CommandInteraction, serverData: IGuildServer) {
    try {
      const { playerData, guildData } = await this.getGameData(serverData.allyCode);
      const guildResetTime = new Date(parseFloat(guildData.guild.nextChallengesRefresh) * 1000).toISOString();
      const newServer = await prisma.serverTable.create({
        data: {
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          triggerPhrase: '',
          strikeResetPeriod: 1,
          serverId: interaction.guildId,
          serverName: interaction.guild.name,
          guildId: playerData.guildId,
          guildName: playerData.guildName,
          ticketStrikesActive: serverData.ticketStrikesEnabled,
          guildResetTime,
        },
      });

      Logger.info(`Created server entry for server: ${newServer.serverName}`);
      return newServer;
    } catch (error) {
      Logger.error(`Error creating server entry: ${error}`);
      throw new Error('Failed to create server entry');
    }
  }

  static async updateServerTable(interaction: ChatInputCommandInteraction, serverData: IGuildServer) {
    try {
      const { guildData, playerData } = await this.getGameData(serverData.allyCode);
      const dateInEpoch = Number(guildData.guild.nextChallengesRefresh) * 1000;
      const guildResetTime = new Date(dateInEpoch).toISOString();

      const updatedRecord = await prisma.serverTable.update({
        where: { serverId: interaction.guildId },
        data: {
          guildResetTime,
          guildId: playerData.guildId,
          guildName: playerData.guildName,
          ticketStrikesActive: serverData.ticketStrikesEnabled,
          updatedDate: new Date().toISOString(),
        },
      });
      return updatedRecord;
    } catch (error) {
      Logger.info(error);
    }
  }

  static async updateServerTableGuildResetTime(server: ServerWithRelations) {
    try {
      const updatedRecord = await prisma.serverTable.update({
        where: { serverId: server.serverId },
        data: {
          guildResetTime: new Date(server.guildResetTime).toISOString(),
          updatedDate: new Date().toISOString(),
        },
      });
      return updatedRecord;
    } catch (error) {
      Logger.info(error);
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
        include: {
          channels: true,
          guildStrikes: true,
          limits: true,
          members: true,
          roles: true,
        },
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

  static async getGuildResetTimes() {
    try {
      const date = new Date();
      date.setHours(date.getHours() + Math.round(date.getMinutes() / 60));
      date.setMinutes(30, 0, 0);
      const result = [];

      const serverRecord = await prisma.serverTable.findMany({
        include: {
          channels: true,
          guildStrikes: true,
          limits: true,
          members: true,
          roles: true,
        },
      });

      for (const server of serverRecord) {
        if (!server.guildResetTime) {
          continue;
        }
        if (server.guildResetTime.getTime() < date.getTime()) {
          const guildData = await Comlink.getGuildInfoByGuildId(server.guildId);
          server.guildResetTime = new Date(parseFloat(guildData.guild.nextChallengesRefresh) * 1000);
          this.updateServerTableGuildResetTime(server);
        }
        if (server.guildResetTime && server.guildResetTime.getTime() === date.getTime()) {
          result.push(server);
        }
      }

      if (result.length) {
        Logger.info(`Existing Reset Time`);
        return result;
      }

      return;
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
