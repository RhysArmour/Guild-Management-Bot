import { Prisma, PrismaClient } from '@prisma/client';
import { CommandInteraction, CommandInteractionOptionResolver, InteractionType, Role, TextChannel } from 'discord.js';
import { Logger } from '../logger';

type ServerTableUpdateInput = Prisma.ServerTableUpdateInput;
type StrikeUpdateInput = Prisma.StrikesUpdateInput;
type TicketsUpdateInput = Prisma.TicketsUpdateInput;
type GuildRolesUpdateInput = Prisma.GuildRoleUpdateInput;
type ServerTableCreateInput = Prisma.ServerTableCreateInput;
type StrikeCreateInput = Prisma.StrikesCreateInput;
type TicketsCreateInput = Prisma.TicketsCreateInput;
type GuildRolesCreateInput = Prisma.GuildRoleCreateInput;

export const updateServerTable = (interaction: CommandInteraction, serverData: any) => {
  Logger.info('Create Guild Server Table');

  const guildDataToUpdate: ServerTableUpdateInput = {
    serverId: interaction.guildId!.toString(),
    serverName: interaction.guild!.name,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
  };

  return guildDataToUpdate;
};

export const updateStrikeTable = (interaction: CommandInteraction, serverData: any) => {
  const { strikeChannel, strikeLimitChannel, strikeLimit } = serverData;

  if (strikeChannel && strikeLimitChannel) {
    const guildDataToUpdate: StrikeUpdateInput | StrikeCreateInput = {
      strikeChannelName: strikeChannel.name,
      strikeChannelId: strikeChannel.id,
      strikeLimitChannelId: strikeLimitChannel.id,
      strikeLimitChannelName: strikeLimitChannel.name,
      strikeLimit: strikeLimit,
    };
    return guildDataToUpdate;
  }
};

export const updateTicketsTable = (interaction: CommandInteraction, serverData: any) => {
  const { offenseChannel, ticketLimit, triggerPhrase } = serverData;

  if (offenseChannel) {
    const guildDataToUpdate: TicketsUpdateInput | TicketsCreateInput = {
      ticketChannelName: offenseChannel.name,
      ticketChannelId: offenseChannel.id,
      ticketLimit: ticketLimit,
      triggerPhrase: triggerPhrase,
    };
    return guildDataToUpdate;
  }
};

export const updateRolesTable = (interaction: CommandInteraction, serverData: any) => {
  const { awayRole, guildRole, strikeLimitRole } = serverData;

  if (awayRole && guildRole && strikeLimitRole) {
    const guildDataToUpdate: GuildRolesUpdateInput | GuildRolesCreateInput = {
      absenceRoleId: awayRole.id,
      absenceRoleName: awayRole.name,
      guildRoleId: guildRole.id,
      guildRoleName: guildRole.name,
      strikeLimitRoleId: strikeLimitRole.id,
      strikeLimitRoleName: strikeLimitRole.name,
    };
    return guildDataToUpdate;
  }
};

export const createServerTable = (interaction: CommandInteraction, serverData: any) => {
  Logger.info('Create Guild Server Table');

  const guildDataToCreate: ServerTableCreateInput = {
    serverId: interaction.guildId!.toString(),
    serverName: interaction.guild!.name,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
  };

  return guildDataToCreate;
};

export const createStrikeTable = (interaction: CommandInteraction, serverData: any) => {
  const { strikeChannel, strikeLimitChannel, strikeLimit } = serverData;

  if (strikeChannel && strikeLimitChannel) {
    const guildDataToCreate: StrikeCreateInput = {
      serverId: interaction.guild.id,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      strikeChannelName: strikeChannel.name,
      strikeChannelId: strikeChannel.id,
      strikeLimitChannelId: strikeLimitChannel.id,
      strikeLimitChannelName: strikeLimitChannel.name,
      strikeLimit: strikeLimit,
    };
    return guildDataToCreate;
  }
};

export const createTicketsTable = (interaction: CommandInteraction, serverData: any) => {
  const { offenseChannel, ticketLimit, triggerPhrase } = serverData;

  if (offenseChannel) {
    const guildDataToCreate: TicketsCreateInput = {
      serverId: interaction.guild.id,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      ticketChannelName: offenseChannel.name,
      ticketChannelId: offenseChannel.id,
      ticketLimit: ticketLimit,
      triggerPhrase: triggerPhrase,
    };
    return guildDataToCreate;
  }
};

export const createRolesTable = (interaction: CommandInteraction, serverData: any) => {
  const { awayRole, guildRole, strikeLimitRole } = serverData;

  if (awayRole && guildRole && strikeLimitRole) {
    const guildDataToCreate: GuildRolesCreateInput = {
      serverId: interaction.guild.id,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      absenceRoleId: awayRole.id,
      absenceRoleName: awayRole.name,
      guildRoleId: guildRole.id,
      guildRoleName: guildRole.name,
      strikeLimitRoleId: strikeLimitRole.id,
      strikeLimitRoleName: strikeLimitRole.name,
    };
    return guildDataToCreate;
  }
};

