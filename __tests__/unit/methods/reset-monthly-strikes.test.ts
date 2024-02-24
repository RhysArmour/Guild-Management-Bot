/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandInteraction } from 'discord.js';
import { resetMonthlyStrikes } from '../../../src/methods/reset-monthly-strikes';
import { tearDownDatabase } from '../../teardown-database';
import { seedDatabase, testCreationDate } from '../../seed-database';
import prisma from '../../../src/classes/PrismaClient';
import { choices } from '../../../src/utils/helpers/commandVariables';
import { getLastMonthFullDate } from '../../../src/utils/helpers/get-date';

// (prismaMock.guildMembersTable as any).create.mockResolvedValue(mockValidMember);

const mockValidInteraction: CommandInteraction = { guildId: '0000000001' } as CommandInteraction;

const lastMonth = getLastMonthFullDate();

describe('resetMonthlyStrikes Function', () => {
  beforeEach(async () => {
    await seedDatabase();
  });
  afterEach(async () => {
    jest.clearAllMocks();
    await tearDownDatabase();
  });
  test('When provided a valid interaction, It correctly updates the database and returns void', async () => {
    const result = await resetMonthlyStrikes(mockValidInteraction);

    expect(result).not.toBeDefined();
  });

  test('When all strikes are assigned for the current month, it will not change strike values and will return void', async () => {
    const result = await resetMonthlyStrikes(mockValidInteraction);

    const dbResult = await prisma.guildMembersTable.findMany({
      orderBy: [{ uniqueId: 'asc' }],
      where: {
        serverId: '0000000001',
      },
    });

    expect(result).not.toBeDefined();
    expect(dbResult[1].strikes).toEqual(1);
    expect(dbResult[5].strikes).toEqual(5);
  });

  test('When a strike exists from previous month, it will change strike values and will return void', async () => {
    await prisma.memberStrikeReasons.update({
      where: {
        unique_reason: {
          uniqueId: '0000000001 - 0000000002',
          date: testCreationDate,
          reason: choices[0].name,
        },
      },
      data: {
        date: lastMonth,
      },
    });

    await resetMonthlyStrikes(mockValidInteraction);

    const dbResult = await prisma.guildMembersTable.findMany({
      orderBy: [{ uniqueId: 'asc' }],
      where: {
        serverId: '0000000001',
      },
      include: {
        strikeReasons: true,
      },
    });

    expect(dbResult[1].strikes).toEqual(0);
    expect(dbResult[5].strikes).toEqual(5);
  });

  test('When a member has strikes from this month and last month, it will change the correct strike values and will return void', async () => {
    await prisma.memberStrikeReasons.update({
      where: {
        unique_reason: {
          uniqueId: '0000000001 - 0000000003',
          date: testCreationDate,
          reason: choices[0].name,
        },
      },
      data: {
        date: lastMonth,
      },
    });

    await resetMonthlyStrikes(mockValidInteraction);

    const dbResult = await prisma.guildMembersTable.findMany({
      orderBy: [{ uniqueId: 'asc' }],
      where: {
        serverId: '0000000001',
      },
      include: {
        strikeReasons: true,
      },
    });

    expect(dbResult[2].strikes).toEqual(1);
    expect(dbResult[5].strikes).toEqual(5);
  });

  test('When multiple members has strikes from this month and last month, it will change the correct strike values and will return void', async () => {
    await prisma.memberStrikeReasons.update({
      where: {
        unique_reason: {
          uniqueId: '0000000001 - 0000000003',
          date: testCreationDate,
          reason: choices[0].name,
        },
      },
      data: {
        date: lastMonth,
      },
    });

    await prisma.memberStrikeReasons.update({
      where: {
        unique_reason: {
          uniqueId: '0000000001 - 0000000004',
          date: testCreationDate,
          reason: choices[0].name,
        },
      },
      data: {
        date: lastMonth,
      },
    });

    await resetMonthlyStrikes(mockValidInteraction);

    const dbResult = await prisma.guildMembersTable.findMany({
      orderBy: [{ uniqueId: 'asc' }],
      where: {
        serverId: '0000000001',
      },
      include: {
        strikeReasons: true,
      },
    });

    expect(dbResult[2].strikes).toEqual(1);
    expect(dbResult[3].strikes).toEqual(2);
    expect(dbResult[5].strikes).toEqual(5);
  });

  test('When a strike value is greater than 1, it will remove the correct strike value', async () => {
    await prisma.memberStrikeReasons.update({
      where: {
        unique_reason: {
          uniqueId: '0000000001 - 0000000003',
          date: testCreationDate,
          reason: choices[1].name,
        },
      },
      data: {
        date: lastMonth,
      },
    });

    await prisma.guildStrikeValues.create({
      data: {
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        uniqueId: `0000000001 - ${choices[1].value}`,
        strikeReason: choices[1].value,
        value: 2,
        server: {
          connectOrCreate: {
            where: { serverId: '0000000001' },
            create: {
              serverId: '0000000001',
              serverName: 'Test Server 1',
              createdDate: new Date().toISOString(),
              updatedDate: new Date().toISOString(),
            },
          },
        },
      },
    });

    await resetMonthlyStrikes(mockValidInteraction);

    const dbResult = await prisma.guildMembersTable.findMany({
      orderBy: [{ uniqueId: 'asc' }],
      where: {
        serverId: '0000000001',
      },
      include: {
        strikeReasons: true,
      },
    });

    expect(dbResult[2].strikes).toEqual(0);
    expect(dbResult[3].strikes).toEqual(3);
    expect(dbResult[5].strikes).toEqual(5);
  });
});

