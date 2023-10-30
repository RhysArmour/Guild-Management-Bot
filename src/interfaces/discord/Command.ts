import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  PermissionResolvable,
} from 'discord.js';
import ExtendedClient from '../../classes/ClientClass';

export interface ExtendedInteraction extends CommandInteraction {
  member: GuildMember;
}

interface ExecuteOptions {
  client: ExtendedClient;
  interaction: CommandInteraction;
  args: CommandInteractionOptionResolver;
}

type ExecuteFunction = (options: ExecuteOptions) => any;

export type CommandType = {
  userPermissions?: PermissionResolvable[];
  execute: ExecuteFunction;
} & ChatInputApplicationCommandData;
