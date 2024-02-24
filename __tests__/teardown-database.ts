import prisma from '../src/classes/PrismaClient';
import { Logger } from '../src/logger';

export const tearDownDatabase = async () => {
  Logger.info('Tearing down database');
  await prisma.guildStrikeValues.deleteMany({});
  await prisma.memberStrikeReasons.deleteMany({});
  await prisma.guildLimitsTable.deleteMany({});
  await prisma.guildChannelsTable.deleteMany({});
  await prisma.guildRolesTable.deleteMany({});
  await prisma.guildMembersTable.deleteMany({});
  await prisma.serverTable.deleteMany({});
  await prisma.$disconnect();
  return;
};

