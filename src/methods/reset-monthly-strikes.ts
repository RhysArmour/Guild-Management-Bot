import { CommandInteraction } from 'discord.js';
import { MemberTableServices } from '../database/services/member-services';
import prisma from '../classes/PrismaClient';
import { getLastMonthFullDate } from '../utils/helpers/get-date';
import { Logger } from '../logger';

export const resetMonthlyStrikes = async (interaction: CommandInteraction) => {
  Logger.info('Starting resetMonthlyStrikes');
  try {
    const guildId = interaction.guildId as string;

    const serverMembers = await MemberTableServices.getAllMembersDataByServerId(guildId);

    const lastMonth = getLastMonthFullDate();

    // Create a new Date object for the first day of the previous month
    const startOfPreviousMonthDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfPreviousMonthDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    Logger.info('Looping through serverMembers');
    for (const member of serverMembers) {
      const previousMonthsStrikes = await prisma.memberStrikeReasons.findMany({
        where: {
          serverId: guildId,
          uniqueId: `${guildId} - ${member.memberId}`,
          date: {
            lte: endOfPreviousMonthDate,
            gte: startOfPreviousMonthDate,
          },
        },
      });

      if (previousMonthsStrikes.length > 0) {
        Logger.info(`Strikes found for previous month for Member: ${member.name}`);
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
        const newStrikes = member.strikes - totalStrikesToRemove;

        await prisma.guildMembersTable.update({
          where: { uniqueId: member.uniqueId },
          data: {
            strikes: newStrikes,
          },
        });
      }
    }

    await prisma.memberStrikeReasons.deleteMany({
      where: {
        serverId: guildId,
        date: {
          lte: endOfPreviousMonthDate,
          gte: startOfPreviousMonthDate,
        },
      },
    });
    return;
  } catch (error) {
    Logger.error(error);
  }
};

