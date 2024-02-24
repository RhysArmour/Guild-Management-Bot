import prisma from '../../classes/PrismaClient';
import { CommandInteraction } from 'discord.js';
import { Logger } from '../../logger';
import { IGuildRoles } from '../../interfaces/methods/bot-setup';

export class RoleTableService {
  private static async mapRoleData(data: IGuildRoles) {
    const { strikeLimitRole, guildRole, absenceRole } = data;
    return {
      strikeLimitRoleId: strikeLimitRole.id,
      strikeLimitRoleName: strikeLimitRole.name,
      guildRoleId: guildRole.id,
      guildRoleName: guildRole.name,
      absenceRoleId: absenceRole.id,
      absenceRoleName: absenceRole.name,
    };
  }

  static async createGuildRolesByInteraction(interaction: CommandInteraction, data: IGuildRoles) {
    try {
      const serverId = interaction.guildId as string;
      const mappedData = await this.mapRoleData(data);
      const serverName = interaction.guild.name;

      const newRoles = await prisma.guildRolesTable.create({
        data: {
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          ...mappedData,
          server: {
            connectOrCreate: {
              where: { serverId },
              create: {
                serverId,
                serverName,
                createdDate: new Date().toISOString(),
                updatedDate: new Date().toISOString(),
              },
            },
          },
        },
      });

      Logger.info(`Created roles for server: ${serverName}`);
      return newRoles;
    } catch (error) {
      Logger.error(`Error creating roles: ${error}`);
      throw new Error('Failed to create roles');
    }
  }

  static async updateGuildRolesEntryByInteraction(interaction: CommandInteraction, data: IGuildRoles) {
    try {
      const mappedData = await this.mapRoleData(data);
      const serverId = interaction.guildId;
      const serverName = interaction.guild.name;

      const updatedRoles = await prisma.guildRolesTable.update({
        where: { serverId },
        data: mappedData,
      });

      Logger.info(`Updated roles for server: ${serverName}`);
      return updatedRoles;
    } catch (error) {
      Logger.error(`Error updating roles: ${error}`);
      throw new Error('Failed to update roles');
    }
  }

  static async deleteGuildRolesEntryByServerId(serverId: string) {
    try {
      return await prisma.guildRolesTable.delete({
        where: { serverId },
      });
    } catch (error) {
      Logger.error(`Error deleting roles: ${error}`);
      throw new Error('Failed to delete roles');
    }
  }

  static async getRolesByServerId(serverId: string) {
    try {
      const roles = await prisma.guildRolesTable.findUnique({
        where: { serverId },
      });

      if (roles) {
        Logger.info(`Retrieved roles for server: ${roles.serverId}`);
      } else {
        Logger.warn(`Roles not found for server with ID: ${serverId}`);
      }

      return roles;
    } catch (error) {
      Logger.error(`Error getting roles: ${error}`);
      throw new Error('Failed to get roles');
    }
  }
}
