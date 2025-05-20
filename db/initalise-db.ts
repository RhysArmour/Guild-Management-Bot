import { sequelize } from '.';
import { Logger } from '../src/logger';

// Sync models with the database
export const initializeDatabase = async () => {
  try {
    Logger.info('Attempting to authenticate DB connection');

    await sequelize.authenticate();

    // Use `force: true` or `alter: true` carefully (in dev environments only)
    await sequelize.sync();
    Logger.info('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
