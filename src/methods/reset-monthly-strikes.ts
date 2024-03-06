import { CommandInteraction } from 'discord.js';
import { MemberTableServices } from '../database/services/member-services';
import prisma from '../classes/PrismaClient';
import { getLastMonthFullDate } from '../utils/helpers/get-date';
import { Logger } from '../logger';
import { StrikeReasonsServices } from '../database/services/strike-reason-services';
import { ServerTableService } from '../database/services/server-services';

export const resetMonthlyStrikes = async (interaction: CommandInteraction | string) => {
  Logger.info('Starting resetMonthlyStrikes');

  try {
    let guildId: string;
    if (interaction instanceof CommandInteraction) {
      guildId = interaction.guildId as string;
    } else {
      guildId = interaction;
    }

    const lastMonth = getLastMonthFullDate();

    // Create a new Date object for the first day of the previous month
    const startOfPreviousMonthDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfPreviousMonthDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
    const previousMonthsStrikes = await prisma.memberStrikeReasons.findMany({
      where: {
        serverId: guildId,
        date: {
          lte: endOfPreviousMonthDate,
          gte: startOfPreviousMonthDate,
        },
      },
      include: {
        member: true,
      },
    });

    if (previousMonthsStrikes.length > 0) {
      for (const strike of previousMonthsStrikes) {
        Logger.info(`Strikes found for previous month for Member: ${strike.member.name}`);
        let totalStrikesToRemove = 0;

        Logger.info('Looping through previousMonthStrike values');
        for (const strike of previousMonthsStrikes) {
          const strikeValue = await prisma.guildStrikeValues.findFirst({
            where: { serverId: guildId, strikeReason: strike.reason },
          });
          if (!strikeValue) {
            Logger.info('No strike value assigned. Setting to 1 strike');
            totalStrikesToRemove += 1;
          } else {
            totalStrikesToRemove += strikeValue.value;
          }
        }

        Logger.info(`Removing ${totalStrikesToRemove} strikes`);
        const newStrikes = strike.member.strikes - totalStrikesToRemove;

        await MemberTableServices.strikeResetUpdate(strike.member.uniqueId, newStrikes);
      }
    }

    await StrikeReasonsServices.strikeReasonsReset(guildId, startOfPreviousMonthDate, endOfPreviousMonthDate);
    await ServerTableService.updateLastStrikeResetEntryByServerId(guildId);

    return;
  } catch (error) {
    Logger.error(error);
  }
};

