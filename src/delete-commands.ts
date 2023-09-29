import { REST, Routes } from 'discord.js';
import config from './config';

const rest = new REST().setToken(config.token);

// for guild-based commands
rest
  .put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: [] })
  .then(() => console.log('Successfully deleted all guild commands.'))
  .catch(console.error);

// for global commands
rest
  .put(Routes.applicationCommands(config.clientId), { body: [] })
  .then(() => console.log('Successfully deleted all application commands.'))
  .catch(console.error);
