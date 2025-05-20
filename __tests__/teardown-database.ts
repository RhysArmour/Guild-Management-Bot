import { Channels, DiscordUser, Member, Roles, Server, Account, Guild, Strikes, sequelize } from '../db';
import { Logger } from '../src/logger';

export const tearDownDatabase = async () => {
  Logger.info('Tearing down database');
  sequelize.authenticate();
  await Server.destroy({ cascade: true, truncate: true, force: true });
  await Channels.destroy({ cascade: true, truncate: true, force: true });
  await Roles.destroy({ cascade: true, truncate: true, force: true });
  await Member.destroy({ cascade: true, truncate: true, force: true });
  await Strikes.destroy({ cascade: true, truncate: true, force: true });
  await Guild.destroy({ cascade: true, truncate: true, force: true });
  await Account.destroy({ cascade: true, truncate: true, force: true });
  await DiscordUser.destroy({ cascade: true, truncate: true, force: true });
  Logger.info('Database teardown completed successfully');
  await sequelize.close();
  return;
};

tearDownDatabase();
