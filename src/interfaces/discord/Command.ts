import {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  PermissionResolvable,
} from 'discord.js';
import ExtendedClient from '../../classes/ClientClass';

export interface ExtendedInteraction extends ChatInputCommandInteraction {
  member: GuildMember;
}

interface ExecuteOptions {
  client: ExtendedClient;
  interaction: ChatInputCommandInteraction;
  args: CommandInteractionOptionResolver;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExecuteFunction = (options: ExecuteOptions) => any;

export type CommandType = {
  userPermissions?: PermissionResolvable[];
  execute: ExecuteFunction;
} & ChatInputApplicationCommandData;
