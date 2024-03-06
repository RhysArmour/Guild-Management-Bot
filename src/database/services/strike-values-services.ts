import { Logger } from '../../logger';
import prisma from '../../classes/PrismaClient';
import { CommandInteraction } from 'discord.js';
import { IStrikeValue } from '../../interfaces/database/strike-values';

export class StrikeValuesTableService {
  static async createStrikeValuesByInteraction(interaction: CommandInteraction, data: IStrikeValue) {
    try {
      Logger.info('Starting createStrikeValuesByInteraction method');
      const serverId = interaction.guildId as string;
      const uniqueId = `${serverId} - ${data.strikeReason}`;
      const createdStrikeValue = await prisma.guildStrikeValues.create({
        data: {
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          uniqueId,
          strikeReason: data.strikeReason,
          value: data.value,
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

      Logger.info(
        `Created strike value entry for strike reason ${data.strikeReason} on server ${interaction.guild.name}`,
      );
      return createdStrikeValue;
    } catch (error) {
      Logger.error(`Error creating strike value entry: ${error}`);
      throw new Error('Failed to create strike value entry');
    }
  }

  static async updateStrikeValuesByInteraction(interaction: CommandInteraction, data: IStrikeValue) {
    try {
      Logger.info('Starting updateStrikeValuesByInteraction method');
      const uniqueId = `${interaction.guildId} - ${data.strikeReason}`;
      const updatedStrikeValue = await prisma.guildStrikeValues.update({
        where: { uniqueId },
        data,
      });

      Logger.info(
        `Updated strike value entry for strike reason ${data.strikeReason} on server ${interaction.guild.name}`,
      );
      return updatedStrikeValue;
    } catch (error) {
      Logger.error(`Error updating strike value entry: ${error}`);
      throw new Error('Failed to update strike value entry');
    }
  }

  static async getIndividualStrikeValueByInteraction(interaction: CommandInteraction, reason: string) {
    try {
      Logger.info('Starting getIndividualStrikeValueByInteraction method');
      const uniqueId = `${interaction.guildId} - ${reason}`;
      const strikeValueEntry = await prisma.guildStrikeValues.findUnique({
        where: { uniqueId },
      });
      let result: number;

      if (strikeValueEntry) {
        Logger.info(
          `Retrieved strike value (${strikeValueEntry.value}) entry for strike reason ${reason} on server ${interaction.guild.name}`,
        );
        result = strikeValueEntry.value;
      } else {
        Logger.warn(`Strike value entry not found for strike reason ${reason} on server ${interaction.guild.name}`);
        result = 1;
      }

      return result;
    } catch (error) {
      Logger.error(`Error getting strike value entry: ${error}`);
      throw new Error('Failed to get strike value entry');
    }
  }

  static async getAllGuildStrikeValueObjectByServerId(serverId: string) {
    try {
      Logger.info('Starting getAllGuildStrikeValueObjectByInteraction method');
      const strikeValueEntry = await prisma.guildStrikeValues.findMany({
        where: { serverId },
      });

      return strikeValueEntry;
    } catch (error) {
      Logger.error(`Error getting strike value entry: ${error}`);
      throw new Error('Failed to get strike value entry');
    }
  }
}
