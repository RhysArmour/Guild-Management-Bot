import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { timezone: 'Europe/London', useUTC: false },
  logging: false,
  pool: {
    max: 15,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
});

// Import models and associations
import { Account, Channels, Guild, Member, Roles, Server, Strikes, DiscordUser } from './models';

export { Account, Channels, Guild, Member, Roles, Server, Strikes, DiscordUser };
