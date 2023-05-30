import { ApplicationCommandDataResolvable, Client, ClientEvents, ClientOptions, Collection, GatewayIntentBits } from 'discord.js';
import { CommandType } from '../interfaces/discord/Command';
import config from '../config';
import { glob } from 'glob';
import { Logger } from '../logger';
import { RegisterCommandsOptions } from '../interfaces/discord/RegisterCommands';
import { Event } from './Event';

export default class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();

  constructor() {
    super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
  }

  start() {
    this.registerModules();
    this.login(config.token);
  }

  async importFile(filePath: string) {
    const file = await import(filePath)
    return file.default;
  }

  async registerCommmands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands);
      Logger.info('Registering Commands Locally');
    } else {
      this.application?.commands.set(commands);
      Logger.info('Registering Commands Globally');
    }
  }

  async registerModules() {
    //Commands
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    const commandFiles = await glob(`${__dirname}/../commands/*/*.js`);
    commandFiles.forEach(async (filePath) => {
      const command = await this.importFile(filePath);
      if (!command.name) return;

      this.commands.set(command.name, command);
      slashCommands.push(command);
    });

    this.on('ready', () => {
      this.registerCommmands({
        commands: slashCommands,
        guildId: config.guildId
      })
    })

    // Event
    const eventFiles = await glob(`${__dirname}/../events/*.js`);
    eventFiles.forEach(async filePath => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath)
      this.on(event.event, event.execute)
    })
  }
}
