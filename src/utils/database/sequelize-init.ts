import { Sequelize } from 'sequelize-typescript';
import { GuildBotData } from './models/bot-db';
import { GuildUserTable } from './models/guild-db'


export const connectToPostgres = async () => {
  const sequelize = new Sequelize({
    host: 'localhost',
    port: 5432,
    database: 'dev',
    dialect: 'postgres',
    username: 'postgres',
    password: 'admin',
    logging: msg => console.log
  }
  );
  try {
    console.log('attempting to add models');
    const model = sequelize.addModels([GuildBotData, GuildUserTable]);
    console.log(`Models ${model} added. Starting authentication`);
    await sequelize.authenticate();
    console.log('Connection Established to Database');
  } catch (error) {
    console.error(error)
    console.error('Unable to Authenticate Database');
  }
};
