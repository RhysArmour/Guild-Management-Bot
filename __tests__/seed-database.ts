import prisma from '../src/classes/PrismaClient';
import { Logger } from '../src/logger';
import { choices } from '../src/utils/helpers/commandVariables';

export const testCreationDate = new Date().toISOString();

export const seedDatabase = async () => {
  await prisma.$connect();
  Logger.info('Connected To Database');

  const existingDb = await prisma.serverTable.findFirst({ where: { serverId: '0000000001' } });

  if (existingDb) {
    Logger.info('Database already exists. Exiting Seeding Process');
    return;
  }

  Logger.info('Seeding server table');
  await seedServerTable();
  Logger.info('Server table seeded successfully');

  Logger.info('Seeding channels table');
  await seedChannelsTable();
  Logger.info('Channels table seeded successfully');

  Logger.info('Seeding roles table');
  await seedRolesTable();
  Logger.info('Roles table seeded successfully');

  Logger.info('Seeding limits table');
  await seedLimitsTable();
  Logger.info('Limits table seeded successfully');

  Logger.info('Seeding members table');
  await seedMembersTable();
  Logger.info('Member table seeded successfully');

  Logger.info('Seeding Strike Reasons table');
  await seedStrikeReasonsTable();
  Logger.info('Strike Reasons table seeded successfully');

  return;
};

const seedServerTable = async () => {
  await prisma.serverTable.create({
    data: {
      createdDate: testCreationDate,
      updatedDate: testCreationDate,
      serverId: '0000000001',
      serverName: 'Test Server 1',
    },
  });
};

const seedChannelsTable = async () => {
  await prisma.guildChannelsTable.create({
    data: {
      createdDate: testCreationDate,
      updatedDate: testCreationDate,
      strikeChannelId: 'Test Strike Channel ID 1',
      strikeChannelName: 'Test Strike Channel Name 1',
      ticketChannelId: 'Test Ticket Channel ID 1',
      ticketChannelName: 'Test Ticket Channel Name 1',
      strikeLimitChannelId: 'Test Strike Limit Channel ID 1',
      strikeLimitChannelName: 'Test Strike Limit Channel Name 1',
      server: {
        connectOrCreate: {
          where: { serverId: '0000000001' },
          create: {
            serverId: '0000000001',
            serverName: 'Test Server 1',
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
          },
        },
      },
    },
  });
};

const seedRolesTable = async () => {
  await prisma.guildRolesTable.create({
    data: {
      createdDate: testCreationDate,
      updatedDate: testCreationDate,
      strikeLimitRoleId: 'Test Strike Limit Role ID 1',
      strikeLimitRoleName: 'Test Strike Limit Role Name 1',
      guildRoleId: 'Test Guild Role ID 1',
      guildRoleName: 'Test Guild Role Name 1',
      absenceRoleId: 'Test Absence Role ID 1',
      absenceRoleName: 'Test Absence Role Name 1',
      server: {
        connectOrCreate: {
          where: { serverId: '0000000001' },
          create: {
            serverId: '0000000001',
            serverName: 'Test Server 1',
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
          },
        },
      },
    },
  });
};

const seedLimitsTable = async () => {
  await prisma.guildLimitsTable.create({
    data: {
      createdDate: testCreationDate,
      updatedDate: testCreationDate,
      strikeLimit: 5,
      ticketLimit: 500,
      server: {
        connectOrCreate: {
          where: { serverId: '0000000001' },
          create: {
            serverId: '0000000001',
            serverName: 'Test Server 1',
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
          },
        },
      },
    },
  });
};

const seedMembersTable = async () => {
  await prisma.guildMembersTable.create({
    data: {
      uniqueId: `0000000001 - 0000000001`,
      serverName: 'Test Server 1',
      memberId: '0000000001',
      name: 'Test Member 1 - Fresh Entry',
      username: 'Test Member 1 Username',
      strikes: 0,
      lifetimeStrikes: 0,
      absent: false,
      createdDate: testCreationDate,
      updatedDate: testCreationDate,
      server: {
        connectOrCreate: {
          where: { serverId: '0000000001' },
          create: {
            serverId: '0000000001',
            serverName: 'Test Server 1',
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
          },
        },
      },
    },
  });
  await prisma.guildMembersTable.create({
    data: {
      uniqueId: `0000000001 - 0000000002`,
      serverName: 'Test Server 1',
      memberId: '0000000002',
      name: 'Test Member 2 - 1 Strike',
      username: 'Test Member 2 Username',
      strikes: 1,
      lifetimeStrikes: 1,
      absent: false,
      createdDate: testCreationDate,
      updatedDate: testCreationDate,
      server: {
        connectOrCreate: {
          where: { serverId: '0000000001' },
          create: {
            serverId: '0000000001',
            serverName: 'Test Server 1',
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
          },
        },
      },
    },
  });
  await prisma.guildMembersTable.create({
    data: {
      uniqueId: `0000000001 - 0000000003`,
      serverName: 'Test Server 1',
      memberId: '0000000003',
      name: 'Test Member 3 - 2 Strikes',
      username: 'Test Member 3 Username',
      strikes: 2,
      lifetimeStrikes: 2,
      absent: false,
      createdDate: testCreationDate,
      updatedDate: testCreationDate,
      server: {
        connectOrCreate: {
          where: { serverId: '0000000001' },
          create: {
            serverId: '0000000001',
            serverName: 'Test Server 1',
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
          },
        },
      },
    },
  });
  await prisma.guildMembersTable.create({
    data: {
      uniqueId: `0000000001 - 0000000004`,
      serverName: 'Test Server 1',
      memberId: '0000000004',
      name: 'Test Member 4 - 3 Strikes',
      username: 'Test Member 4 Username',
      strikes: 3,
      lifetimeStrikes: 3,
      absent: false,
      createdDate: testCreationDate,
      updatedDate: testCreationDate,
      server: {
        connectOrCreate: {
          where: { serverId: '0000000001' },
          create: {
            serverId: '0000000001',
            serverName: 'Test Server 1',
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
          },
        },
      },
    },
  });
  await prisma.guildMembersTable.create({
    data: {
      uniqueId: `0000000001 - 0000000005`,
      serverName: 'Test Server 1',
      memberId: '0000000005',
      name: 'Test Member 5 - 4 strikes',
      username: 'Test Member 5 Username',
      strikes: 4,
      lifetimeStrikes: 4,
      absent: false,
      createdDate: testCreationDate,
      updatedDate: testCreationDate,
      server: {
        connectOrCreate: {
          where: { serverId: '0000000001' },
          create: {
            serverId: '0000000001',
            serverName: 'Test Server 1',
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
          },
        },
      },
    },
  });
  await prisma.guildMembersTable.create({
    data: {
      uniqueId: `0000000001 - 0000000006`,
      serverName: 'Test Server 1',
      memberId: '0000000006',
      name: 'Test Member 6 - Strike Limit',
      username: 'Test Member 6 Username',
      strikes: 5,
      lifetimeStrikes: 5,
      absent: false,
      createdDate: testCreationDate,
      updatedDate: testCreationDate,
      server: {
        connectOrCreate: {
          where: { serverId: '0000000001' },
          create: {
            serverId: '0000000001',
            serverName: 'Test Server 1',
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
          },
        },
      },
    },
  });
};

const seedStrikeReasonsTable = async () => {
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 2 - 1 Strike',
      reason: choices[0].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000002` },
          create: {
            uniqueId: `0000000001 - 0000000002`,
            serverName: 'Test Server 1',
            memberId: '0000000002',
            name: 'Test Member 2 - 1 Strike',
            username: 'Test Member 2 Username',
            strikes: 1,
            lifetimeStrikes: 1,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 3 - 2 Strike',
      reason: choices[0].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000003` },
          create: {
            uniqueId: `0000000001 - 0000000003`,
            serverName: 'Test Server 1',
            memberId: '0000000003',
            name: 'Test Member 3 - 2 Strike',
            username: 'Test Member 3 Username',
            strikes: 2,
            lifetimeStrikes: 2,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 3 - 2 Strike',
      reason: choices[1].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000003` },
          create: {
            uniqueId: `0000000001 - 0000000003`,
            serverName: 'Test Server 1',
            memberId: '0000000003',
            name: 'Test Member 3 - 2 Strike',
            username: 'Test Member 3 Username',
            strikes: 2,
            lifetimeStrikes: 2,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 4 - 3 Strike',
      reason: choices[0].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000004` },
          create: {
            uniqueId: `0000000001 - 0000000004`,
            serverName: 'Test Server 1',
            memberId: '0000000004',
            name: 'Test Member 4 - 3 Strike',
            username: 'Test Member 4 Username',
            strikes: 3,
            lifetimeStrikes: 3,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 4 - 3 Strike',
      reason: choices[1].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000004` },
          create: {
            uniqueId: `0000000001 - 0000000004`,
            serverName: 'Test Server 1',
            memberId: '0000000004',
            name: 'Test Member 4 - 3 Strike',
            username: 'Test Member 4 Username',
            strikes: 3,
            lifetimeStrikes: 3,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 4 - 3 Strike',
      reason: choices[2].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000004` },
          create: {
            uniqueId: `0000000001 - 0000000004`,
            serverName: 'Test Server 1',
            memberId: '0000000004',
            name: 'Test Member 4 - 3 Strike',
            username: 'Test Member 4 Username',
            strikes: 3,
            lifetimeStrikes: 3,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 5 - 4 Strike',
      reason: choices[0].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000005` },
          create: {
            uniqueId: `0000000001 - 0000000005`,
            serverName: 'Test Server 1',
            memberId: '0000000005',
            name: 'Test Member 5 - 4 Strike',
            username: 'Test Member 5 Username',
            strikes: 4,
            lifetimeStrikes: 4,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 5 - 4 Strike',
      reason: choices[1].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000005` },
          create: {
            uniqueId: `0000000001 - 0000000005`,
            serverName: 'Test Server 1',
            memberId: '0000000005',
            name: 'Test Member 5 - 4 Strike',
            username: 'Test Member 5 Username',
            strikes: 4,
            lifetimeStrikes: 4,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 5 - 4 Strike',
      reason: choices[2].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000005` },
          create: {
            uniqueId: `0000000001 - 0000000005`,
            serverName: 'Test Server 1',
            memberId: '0000000005',
            name: 'Test Member 5 - 4 Strike',
            username: 'Test Member 5 Username',
            strikes: 4,
            lifetimeStrikes: 4,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 5 - 4 Strike',
      reason: choices[4].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000005` },
          create: {
            uniqueId: `0000000001 - 0000000005`,
            serverName: 'Test Server 1',
            memberId: '0000000005',
            name: 'Test Member 5 - 4 Strike',
            username: 'Test Member 5 Username',
            strikes: 4,
            lifetimeStrikes: 4,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 6 - Strike Limit',
      reason: choices[0].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000006` },
          create: {
            uniqueId: `0000000001 - 0000000006`,
            serverName: 'Test Server 1',
            memberId: '0000000006',
            name: 'Test Member 6 - Strike Limit',
            username: 'Test Member 6 Username',
            strikes: 5,
            lifetimeStrikes: 5,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 6 - Strike Limit',
      reason: choices[1].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000006` },
          create: {
            uniqueId: `0000000001 - 0000000006`,
            serverName: 'Test Server 1',
            memberId: '0000000006',
            name: 'Test Member 6 - Strike Limit',
            username: 'Test Member 6 Username',
            strikes: 5,
            lifetimeStrikes: 5,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 6 - Strike Limit',
      reason: choices[2].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000006` },
          create: {
            uniqueId: `0000000001 - 0000000006`,
            serverName: 'Test Server 1',
            memberId: '0000000006',
            name: 'Test Member 6 - Strike Limit',
            username: 'Test Member 6 Username',
            strikes: 5,
            lifetimeStrikes: 5,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 6 - Strike Limit',
      reason: choices[3].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000006` },
          create: {
            uniqueId: `0000000001 - 0000000006`,
            serverName: 'Test Server 1',
            memberId: '0000000006',
            name: 'Test Member 6 - Strike Limit',
            username: 'Test Member 6 Username',
            strikes: 5,
            lifetimeStrikes: 5,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.memberStrikeReasons.create({
    data: {
      date: testCreationDate,
      serverId: '0000000001',
      name: 'Test Member 6 - Strike Limit',
      reason: choices[4].name,
      member: {
        connectOrCreate: {
          where: { uniqueId: `0000000001 - 0000000006` },
          create: {
            uniqueId: `0000000001 - 0000000006`,
            serverName: 'Test Server 1',
            memberId: '0000000006',
            name: 'Test Member 6 - Strike Limit',
            username: 'Test Member 6 Username',
            strikes: 5,
            lifetimeStrikes: 5,
            absent: false,
            createdDate: testCreationDate,
            updatedDate: testCreationDate,
            server: {
              connectOrCreate: {
                where: { serverId: '0000000001' },
                create: {
                  serverId: '0000000001',
                  serverName: 'Test Server 1',
                  createdDate: testCreationDate,
                  updatedDate: testCreationDate,
                },
              },
            },
          },
        },
      },
    },
  });
};

