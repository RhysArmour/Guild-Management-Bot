import { Prisma, PrismaClient } from '@prisma/client';
import { CommandInteraction, CommandInteractionOptionResolver, InteractionType, Role, TextChannel } from 'discord.js';
import {
  updateServerTable,
  updateStrikeTable,
  updateTicketsTable,
  updateRolesTable,
  createStrikeTable,
  createTicketsTable,
  createRolesTable,
  createServerTable
} from '../services/bot-setup';
import { Logger } from '../logger';

const prisma = new PrismaClient();

export const setupGuildData = async (interaction: CommandInteraction, serverData: any) => {
  Logger.info('Guild Data Setup');

  if (interaction.type !== InteractionType.ApplicationCommand || !interaction.isChatInputCommand()) {
    Logger.error('Cannot complete setup. Interaction is not an Application Command');
    return 'Cannot complete setup. Interaction is not an Application Command ';
  }

  try {
    const serverId = interaction.guildId!.toString();

    Logger.info(`Beggining Upsert operation on serverTable for server: \n Name: ${interaction.guild.name} \n Id: ${serverId}`)
    await prisma.serverTable.upsert({
      where: { serverId: serverId },
      update: { ...updateServerTable(interaction, serverData) },
      create: { ...createServerTable(interaction, serverData) },
    });

    Logger.info(`Beggining Upsert operation on strikes table for server: \n Name: ${interaction.guild.name} \n Id: ${serverId}`)
    await prisma.strikes.upsert({
      where: { serverId: serverId },
      create: {
        ...createStrikeTable(interaction, serverData),
      },
      update: { ...updateStrikeTable(interaction, serverData) },
    });

    Logger.info(`Beggining Upsert operation on tickets table for server: \n Name: ${interaction.guild.name} \n Id: ${serverId}`)
    await prisma.tickets.upsert({
      where: { serverId: serverId },
      create: {
        ...createTicketsTable(interaction, serverData),
      },
      update: { ...updateTicketsTable(interaction, serverData) },
    });

    Logger.info(`Beggining Upsert operation on roles table for server: \n Name: ${interaction.guild.name} \n Id: ${serverId}`)
    await prisma.guildRole.upsert({
      where: { serverId: serverId },
      create: {
        ...createRolesTable(interaction, serverData),
      },
      update: { ...updateRolesTable(interaction, serverData) },
    });

    Logger.info(`Server Data updates complete, returning response`)

    return 'Bot Setup Completed'
  } catch (error) {
    Logger.error(`An error occurred while setting up guild data: ${error}`);
    return 'Failed to set up guild data';
  }
};
