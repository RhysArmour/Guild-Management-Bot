import ExtendedClient from './classes/ClientClass';
import { Logger } from './logger';
import { Cron } from 'croner';
import config from './config';
import { runHourlyChecks, runDailyChecks } from './methods/daily-checks';

export const client = new ExtendedClient();

client.start();

client.on('ready', async () => {
  Logger.info('Bot is Ready');
  Logger.info('Setting up Cron Schedule.');
  Cron('30 29 * * * *', { timezone: 'UTC' }, async () => await runHourlyChecks());
  Cron('0 0 * * *', { timezone: 'UTC' }, async () => await runDailyChecks());
});

client.login(config.token);
