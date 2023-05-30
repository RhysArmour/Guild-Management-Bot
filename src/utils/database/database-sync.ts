import { Logger } from '../../logger';
import { GuildUserTable } from './models/guild-db';
import { GuildBotData } from './models/bot-db';
import { connectToPostgres } from './sequelize-init';

Logger.info('Attempting Connect to Postgres');
connectToPostgres();
GuildUserTable.sync().then(() => Logger.info('GuildUserTable is ready'));
GuildBotData.sync().then(() => Logger.info('GuildBotSetup is ready'));

