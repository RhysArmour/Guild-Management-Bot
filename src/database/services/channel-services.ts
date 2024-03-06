import prisma from '../../classes/PrismaClient';
import { CommandInteraction } from 'discord.js';
import { Logger } from '../../logger';
import { IGuildChannels } from '../../interfaces/methods/bot-setup';

export class ChannelTableService {
  private static async mapChannelData(data: IGuildChannels) {
    const { strikeChannel, ticketChannel, strikeLimitChannel } = data;
    return {
      strikeChannelId: strikeChannel.id,
      strikeChannelName: strikeChannel.name,
      ticketChannelId: ticketChannel.id,
      ticketChannelName: ticketChannel.name,
      strikeLimitChannelId: strikeLimitChannel.id,
      strikeLimitChannelName: strikeLimitChannel.name,
    };
  }

  static async createChannelEntryByInteraction(interaction: CommandInteraction, data: IGuildChannels) {
    try {
      const serverId = interaction.guildId as string;
      const mappedData = await this.mapChannelData(data);
      return await prisma.guildChannelsTable.create({
        data: {
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          ...mappedData,
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
      Logger.error(`Error creating channel entry: ${error}`);
      throw new Error('Failed to create channel entry');
    }
  }

  static async updateChannelEntryByInteraction(interaction: CommandInteraction, data: IGuildChannels) {
    try {
      const updatedData = await this.mapChannelData(data);
      return await prisma.guildChannelsTable.update({
        where: { serverId: interaction.guildId },
        data: updatedData,
      });
    } catch (error) {
      Logger.error(`Error updating channel entry: ${error}`);
      throw new Error('Failed to update channel entry');
    }
  }

  static async getChannelsByServerId(serverId: string) {
    try {
      return await prisma.guildChannelsTable.findUnique({
        where: { serverId },
      });
    } catch (error) {
      Logger.error(`Error getting channel entry: ${error}`);
      throw new Error('Failed to get channel entry');
    }
  }
}
