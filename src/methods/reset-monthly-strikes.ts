import { CommandInteraction } from 'discord.js';
import { MemberTableServices } from '../database/services/member-services';
import prisma from '../database/prisma';

export const resetMonthlyStrikes = async (interaction: CommandInteraction) => {
  const { guildId } = interaction;

  const serverMembers = await MemberTableServices.getAllMembersDataByServerId(guildId);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  let previousMonth = currentMonth - 1;
  let previousYear = currentYear;

  if (previousMonth < 0) {
    previousMonth = 11;
    previousYear -= 1;
  }

  // Create a new Date object for the first day of the previous month
  const startOfPreviousMonthDate = new Date(previousYear, previousMonth, 1);
  const endOfPreviousMonthDate = new Date(previousYear, previousMonth, 31);

  serverMembers.forEach(async (member) => {
    const previousMonthsStrikes = await prisma.memberStrikeReasons.findMany({
      where: {
        serverId: guildId,
        date: {
          lte: endOfPreviousMonthDate,
          gte: startOfPreviousMonthDate,
        },
      },
    });

    await prisma.guildMembersTable.update({
      where: { uniqueId: member.uniqueId },
      data: {
        strikes: member.strikes - previousMonthsStrikes.length,
      },
    });

  });

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
};

