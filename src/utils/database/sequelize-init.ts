import { Sequelize } from 'sequelize-typescript';
import { GuildBotData } from './models/bot-db';
import { GuildUserTable } from './models/guild-db';
import { Logger } from '../../logger';

export const connectToPostgres = async () => {
  const sequelize = new Sequelize({
    host: 'localhost',
    port: 5432,
    database: 'dev',
    dialect: 'postgres',
    username: 'postgres',
    password: 'admin',
    logging: (msg) => Logger.info,
  });
  try {
    Logger.info('attempting to add models');
    const model = sequelize.addModels([GuildBotData, GuildUserTable]);
    Logger.info(`Models ${model} added. Starting authentication`);
    await sequelize.authenticate();
    Logger.info('Connection Established to Database');
  } catch (error) {
    Logger.error(error);
    Logger.error('Unable to Authenticate Database');
  }
};
