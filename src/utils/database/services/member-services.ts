import { Logger } from '../../../logger';
import prisma from '../prisma';

import { CommandInteraction, User } from 'discord.js';
import { removeReasons, updateReasons } from './strike-reason-services';
import { IStrikeReasons } from '../../../interfaces/services/strike-reason-interface';

export const assignStrikes = async (user: User, serverId: string) => {
  try {
    Logger.info(`assignStrikes: Assigning strikes to user ${user.username}`);

    const updatedStrikes = await prisma.members.upsert({
      where: { uniqueId: `${serverId} - ${user.id}` },
      update: {
        strikes: {
          increment: 1,
        },
        lifetimeStrikes: {
          increment: 1,
        },
        updatedDate: new Date().toISOString(),
      },
      create: {
        uniqueId: `${serverId} - ${user.id}`,
        serverId: serverId,
        memberId: user.id,
        name: user.username,
        strikes: 1,
        lifetimeStrikes: 1,
        absent: false,
        currentAbsenceStartDate: '0',
        previousAbsenceDuration: '0',
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
    });

    Logger.info(`assignStrikes: Successfully assigned strikes to user ${user.username}`);

    return updatedStrikes;
  } catch (error) {
    Logger.error(`assignStrikes: Error assigning strikes: ${error}`);
  }
};

export const getStrikes = async (user: User, serverId: string) => {
  try {
    Logger.info(`getStrikes: Retrieving strikes for user ${user.username}`);

    const record = await prisma.members.findUnique({
      where: { uniqueId: `${serverId} - ${user.id}` },
    });

    Logger.info(`getStrikes: Successfully retrieved strikes for user ${user.username}`);

    return record;
  } catch (error) {
    Logger.error(`getStrikes: Error retrieving strikes: ${error}`);
  }
};

export const removeStrikes = async (user: any, serverId: string, strikes: Array<IStrikeReasons>) => {
  let strikeAmount = strikes.length;
  let replyMessage;

  try {
    Logger.info(`removeStrikes: Removing strikes for user ${user.username}`);

    const { message, failedStrikes } = await removeReasons(user, serverId, strikes);
    
    strikeAmount = strikeAmount - failedStrikes.length;

    const updatedStrikes = await prisma.members.update({
      where: { uniqueId: `${serverId} - ${user.id}` },
      data: {
        strikes: {
          decrement: Math.max(0, strikeAmount),
        },
        lifetimeStrikes: {
          decrement: Math.max(0, strikeAmount),
        },
        updatedDate: new Date().toISOString(),
      },
    });

    if (updatedStrikes.strikes < 0) {
      await prisma.members.update({
        where: { uniqueId: `${serverId} - ${user.id}` },
        data: {
          strikes: 0,
          lifetimeStrikes: 0,
          updatedDate: new Date().toISOString(),
        },
      });

      Logger.info(`removeStrikes: Member ${user.username} has no strikes to remove`);

      return {
        removeStrikeMessage: 'Member has no strikes to remove',
        result: updatedStrikes,
      };
    }

    Logger.info(`removeStrikes: Successfully removed strikes for user ${user.username}`);

    return { removeStrikeMessage: message, result: updatedStrikes };
  } catch (error) {
    Logger.error(`removeStrikes: Error removing strikes: ${error}`);
  }
};

export const getUserInfo = async (interaction: CommandInteraction) => {
  try {
    Logger.info('getUserInfo: Retrieving user info');

    const memberDb = await prisma.members.findUnique;

    Logger.info('getUserInfo: Successfully retrieved user info');
  } catch (error) {
    Logger.error(`getUserInfo: Error retrieving user info: ${error}`);
  }
};
