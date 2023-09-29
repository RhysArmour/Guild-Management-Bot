import { Logger } from '../../../logger';
import prisma from '../prisma';
import { currentDate } from '../../helpers/get-date';
import { User } from 'discord.js';
import { IStrikeReasons } from '../../../interfaces/services/strike-reason-interface';

export const updateReasons = async (reason: string, user: User, serverId: string) => {
  Logger.info('Beggining update Reasons');
  const { day, month, year } = currentDate();
  const date = `${day} ${month} ${year}`;
  const uniqueId = `${serverId} - ${user.id}`;
  const reasonObj = { uniqueId, name: user.username, date, reason };
  console.log(`REASONOBJ`, reasonObj);

  try {
    Logger.info('Updating Reasons in Database');
    const updatedReasons = await prisma.strikeReasons.create({
      data: { ...reasonObj },
    });

    const updatedMember = await prisma.members.findUnique({
      where: { uniqueId },
      include: {
        strikeReasons: true,
      },
    });

    console.log('updatedMember', updatedMember);
    console.log(`updatedReasons:`, updatedReasons);
    return updatedMember.strikeReasons;
  } catch (error) {
    Logger.error(error);
  }

  return;
};

export const getReasons = async (user: User, serverId: string) => {
  Logger.info(`Getting Reasons From Database`);
  const { strikeReasons } = await prisma.members.findUnique({
    where: { uniqueId: `${serverId} - ${user.id}` },
    include: {
      strikeReasons: true,
    },
  });
  Logger.info(strikeReasons);
  Logger.info(`Returning Reasons`);
  return strikeReasons;
};

export const filterCurrentMonthReasons = async (user: User, serverId: string) => {
  const record = await getReasons(user, serverId);
  Logger.info(record);
  const { month, year } = currentDate();
  Logger.info('Beggining Filtering Results');
  let result = '';
  for (let i = 0; i < record.length; i++) {
    if (record[i].date.includes(month) && record[i].date.includes(year.toString())) {
      Logger.info(`IN IF, REASON: - ${record[i].reason}`);
      result = `${result}\n${[i + 1]}. ${record[i].date}: ${record[i].reason}`;
    }
  }
  Logger.info(`Reasons Array result ${result}`);
  return result;
};

export const removeReasons = async (user: User, serverId: string, strikes: Array<IStrikeReasons>) => {
  Logger.info(`Begging to remove reasons`);

  let message = 'Strikes Removed:\n';
  let failedMessage = 'Strikes that failed to be removed:\n';
  const uniqueId = `${serverId} - ${user.id}`;
  let reasonsToRemove = [];

  try {
    for (let i = 0; i < strikes.length; i++) {
      reasonsToRemove.push(strikes[i]);
    }
    const record = await getReasons(user, serverId);
    if (record === null ?? undefined ?? []) {
      Logger.info(`No Record for request reasons`);
      return {
        message: 'Member has no exisiting Strikes. Please check input is correct.',
        failedStrikes: strikes,
      };
    }
    for (let i = 0; i < record.length; i++) {
      for (let j = 0; j < reasonsToRemove.length; j++) {
        if (record[i].reason === reasonsToRemove[j].strike) {
          const strikeReason = await prisma.strikeReasons.findFirst({
            where: {
              uniqueId,
              reason: reasonsToRemove[j].strike,
            },
          });

          if (!strikeReason) {
            Logger.warn('StrikeReason not found.');
            return;
          }

          // Delete the StrikeReasons item
          await prisma.strikeReasons.delete({
            where: {
              id: strikeReason.id,
            },
          });

          const checkDeletion = await prisma.strikeReasons.findUnique({
            where: {
              id: strikeReason.id,
            },
          });

          message = message + ` ${i + 1}. ${reasonsToRemove[j].strike} - Reason: ${reasonsToRemove[j].reason}\n`;
          reasonsToRemove.shift();
        }
      }
      continue;
    }

    for (let i = 0; i < reasonsToRemove.length; i++) {
      failedMessage = `${failedMessage} ${i + 1}. ${reasonsToRemove[i].strike}\n`;
    }

    if (failedMessage === `Strikes that failed to be removed:\n`) {
      failedMessage = '';
    }

    message = `${message}\n - ${failedMessage}\n`;
    const result = {
      message: message,
      failedStrikes: reasonsToRemove,
    };
    return result;
  } catch (error) {
    console.log(error);
  }
};
