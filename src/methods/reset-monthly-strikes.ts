import { MemberTableServices } from '../database/services/member-services';
import { Logger } from '../logger';
import { ServerTableService } from '../database/services/server-services';
import { ServerWithRelations } from '../interfaces/database/server-table-interface';

export const resetMonthlyStrikes = async (server: ServerWithRelations) => {
  Logger.info('Starting resetMonthlyStrikes method');

  try {
    Logger.info(`Calling resetAllGuildStrike`);
    await MemberTableServices.resetAllGuildStrikes(server);
    Logger.info(`All strikes set to 0. Calling updateLastStrikeResetEntry`);
    await ServerTableService.updateLastStrikeResetEntry(server);

    return;
  } catch (error) {
    Logger.error(error);
  }
};

