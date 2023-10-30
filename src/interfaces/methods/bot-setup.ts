import { Role, TextChannel } from 'discord.js';

export interface IGuildChannels {
  ticketChannel: TextChannel;
  strikeChannel: TextChannel;
  strikeLimitChannel: TextChannel;
}

export interface IGuildRoles {
  absenceRole: Role;
  guildRole: Role;
  strikeLimitRole: Role;
}

export interface IGuildLimits {
  ticketLimit: number;
  strikeLimit: number;
}

export interface IGuildServer {
  triggerPhrase?: string;
  strikeResetPeriod?: number;
}
