import { PrismaClient } from '@prisma/client';
import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection, GatewayIntentBits } from 'discord.js';
import { CommandType } from '../interfaces/discord/Command';
import config from '../config';
import { glob } from 'glob';
import { Logger } from '../logger';
import { RegisterCommandsOptions } from '../interfaces/discord/RegisterCommands';
import { Event } from './Event';

const prisma = new PrismaClient();

export default class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
      ],
    });

    // Error handling for unhandled promise rejections
    process.on('unhandledRejection', (error: Error | unknown) => {
      Logger.error(`Unhandled promise rejection: ${error}`);
    });

    // Error handling for uncaught exceptions
    process.on('uncaughtException', (error: Error | unknown) => {
      Logger.error(`Uncaught exception: ${error}`);
    });
  }

  async start() {
    try {
      await prisma.$connect(); // Connect to the database
      Logger.info('Connected to Database');
      this.registerModules();
      this.login(config.token);
    } catch (error) {
      Logger.error(`Error starting the bot: ${error}`);
    }
  }

  async importFile(filePath: string) {
    try {
      const file = await import(filePath);
      return file.default;
    } catch (error) {
      Logger.error(`Error importing file "${filePath}":`, error);
      throw error;
    }
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    try {
      if (guildId) {
        this.guilds.cache.get(guildId)?.commands.set(commands);
        Logger.warn('Registering Commands Locally');
      } else {
        this.application?.commands.set(commands);
        Logger.warn('Registering Commands Globally');
      }
    } catch (error) {
      Logger.error('Error registering commands:', error);
    }
  }

  async registerModules() {
    try {
      //Commands
      const slashCommands: ApplicationCommandDataResolvable[] = [];
      let commandFiles;
      if (process.env.NODE_ENV === 'dev') {
        commandFiles = await glob(`${__dirname}/../commands/*/*.ts`);
      } else {
        commandFiles = await glob(`${__dirname}/../commands/*/*.js`);
      }
      commandFiles.forEach(async (filePath) => {
        const command = await this.importFile(filePath);
        if (!command.name) return;

        this.commands.set(command.name, command);
        slashCommands.push(command);
      });

      this.on('ready', () => {
        this.registerCommands({
          commands: slashCommands,
          guildId: config.guildId,
        });
      });

      // Event
      const eventFiles = await glob(`${__dirname}/../events/*.js`);
      eventFiles.forEach(async (filePath) => {
        const event: Event<keyof ClientEvents> = await this.importFile(filePath);
        this.on(event.event, event.execute);
      });
    } catch (error) {
      Logger.error('Error registering modules:', error);
    }
  }
}
