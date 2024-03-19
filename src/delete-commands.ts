import { REST, Routes } from 'discord.js';
import config from './config';
import { Logger } from './logger';

const rest = new REST().setToken(config.token);

// for guild-based commands
rest
  .put(Routes.applicationGuildCommands(config.clientId, process.env.guildId), { body: [] })
  .then(() => Logger.info('Successfully deleted all guild commands.'))
  .catch(console.error);

// for global commands
rest
  .put(Routes.applicationCommands(config.clientId), { body: [] })
  .then(() => Logger.info('Successfully deleted all application commands.'))
  .catch(console.error);
