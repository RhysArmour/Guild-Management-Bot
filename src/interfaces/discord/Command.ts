import {
  AutocompleteInteraction,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  PermissionResolvable,
} from 'discord.js';
import ExtendedClient from '../../classes/ClientClass';
import { Server } from '../../../db';
export interface ExtendedInteraction extends ChatInputCommandInteraction {
  member: GuildMember;
}

export interface ExtendedAutocompleteInteraction extends AutocompleteInteraction {
  member: GuildMember;
}

interface ExecuteOptions {
  client: ExtendedClient;
  interaction: ChatInputCommandInteraction;
  args: CommandInteractionOptionResolver;
}

interface AutoCompleteOptions {
  client: ExtendedClient;
  interaction: AutocompleteInteraction;
  args: CommandInteractionOptionResolver;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExecuteFunction = (options: ExecuteOptions, server: Server) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AutoCompleteFunction = (options: AutoCompleteOptions) => any;

export type CommandType = {
  userPermissions?: PermissionResolvable[];
  autocomplete?: AutoCompleteFunction;
  execute: ExecuteFunction;
} & ChatInputApplicationCommandData;
