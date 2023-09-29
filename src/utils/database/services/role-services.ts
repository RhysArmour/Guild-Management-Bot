import { PrismaClient } from '@prisma/client';
import prisma from '../prisma';

export const getAwayRole = async (serverId: string) => {
  const result = await prisma.guildRole.findUnique({
    where: { serverId: serverId },
  });
  return result.absenceRoleName;
};
