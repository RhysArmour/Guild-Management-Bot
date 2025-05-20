import { sequelize } from '../db';
import { Comlink } from '../src/classes/Comlink';
import { AccountRepository } from '../src/database/repositories/account-repository';
import { ChannelRepository } from '../src/database/repositories/channels-repository';
import { MemberRepository } from '../src/database/repositories/member-repository';
import { RoleRepository } from '../src/database/repositories/roles-repository';
import { ServerRepository } from '../src/database/repositories/server-repository';
import { DiscordUserRepository } from '../src/database/repositories/user-repository';
import { Logger } from '../src/logger';

export const testCreationDate = new Date();

export const seedDatabase = async () => {
  await sequelize.authenticate();
  Logger.info('Connected To Database');

  const existingDb = await new ServerRepository().findById('879052998792319007');

  if (existingDb) {
    Logger.info('Database already exists. Exiting Seeding Process');
    await sequelize.close();
    Logger.info('Database connection closed');
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

  Logger.info('Seeding user table');
  await seedUserTable();
  Logger.info('User table seeded successfully');

  Logger.info('Seeding member table');
  await seedMemberTable();
  Logger.info('Member table seeded successfully');

  Logger.info('Seeding account table');
  await seedAccountTable();
  Logger.info('Account table seeded successfully');

  await sequelize.close();
  Logger.info('Database connection closed');
  Logger.info('Database seeding completed successfully');

  return;
};

const seedServerTable = async () => {
  const guildData = await Comlink.getGuildDataByGuildId('5i2kDDxSQ2Oje1Ykk7Gk7w');
  await new ServerRepository().createServer(
    '879052998792319007',
    {
      createdAt: testCreationDate,
      updatedAt: testCreationDate,
      serverId: '879052998792319007',
      serverName: 'Test Server',
      strikeLimit: 3,
      ticketLimit: 600,
      ticketStrikesActive: true,
      strikeCountMethod: 'member',
    },
    {
      ...guildData,
    },
  );
};

const seedChannelsTable = async () => {
  await new ChannelRepository().createChannels('879052998792319007', {
    createdAt: testCreationDate,
    updatedAt: testCreationDate,
    strikeChannelId: '1075947970857545738',
    strikeChannelName: 'strike-room',
    notificationChannelId: '1075947935302422568',
    notificationChannelName: 'hotbot',
    strikeLimitChannelId: '1121814731381014671',
    strikeLimitChannelName: 'strike-limit-room',
    serverId: '879052998792319007',
  });
};

const seedRolesTable = async () => {
  await new RoleRepository().createRoles('879052998792319007', {
    createdAt: testCreationDate,
    updatedAt: testCreationDate,
    strikeLimitRoleId: 'Test Strike Limit Role ID 1',
    strikeLimitRoleName: 'Test Strike Limit Role Name 1',
    guildRoleId: 'Test Guild Role ID 1',
    guildRoleName: 'Test Guild Role Name 1',
    absenceRoleId: 'Test Absence Role ID 1',
    absenceRoleName: 'Test Absence Role Name 1',
    serverId: '879052998792319007',
  });
};

const seedUserTable = async () => {
  await new DiscordUserRepository().createUser({
    discordId: '602437624791040037',
    userName: 'Armis',
    displayName: 'Armis',
    createdAt: testCreationDate,
    updatedAt: testCreationDate,
  });
};

const seedMemberTable = async () => {
  await new MemberRepository().createMember('879052998792319007', {
    createdAt: testCreationDate,
    updatedAt: testCreationDate,
    displayName: 'Armis',
    discordId: '602437624791040037',
    memberId: '879052998792319007-602437624791040037',
    serverId: '879052998792319007',
  });
};

const seedAccountTable = async () => {
  await new AccountRepository().createPrimaryAccount('602437624791040037', '879052998792319007', {
    allyCode: '242965141',
    name: 'Armis',
    playerId: '123456789',
    rosterUnit: [],
    playerRating: [],
    profileStat: [],
    pvpProfile: [],
    unlockedPlayerTitle: [],
    unlockedPlayerPortrait: [],
    seasonStatus: [],
    datacron: [],
    selectedPlayerTitle: undefined,
    selectedPlayerPortrait: undefined,
    level: 85,
    guildId: '',
    guildName: '',
    guildLogoBackground: '',
    guildBannerColor: '',
    guildBannerLogo: '',
    guildTypeId: '',
    localTimeZoneOffsetMinutes: 0,
    lastActivityTime: undefined,
    lifetimeSeasonScore: '',
  });
  await new AccountRepository().createAltAccount('602437624791040037', '879052998792319007', {
    allyCode: '242965142',
    name: 'Armis Alt',
    playerId: '1029384756',
    rosterUnit: [],
    playerRating: [],
    profileStat: [],
    pvpProfile: [],
    unlockedPlayerTitle: [],
    unlockedPlayerPortrait: [],
    seasonStatus: [],
    datacron: [],
    selectedPlayerTitle: undefined,
    selectedPlayerPortrait: undefined,
    level: 85,
    guildId: '',
    guildName: '',
    guildLogoBackground: '',
    guildBannerColor: '',
    guildBannerLogo: '',
    guildTypeId: '',
    localTimeZoneOffsetMinutes: 0,
    lastActivityTime: undefined,
    lifetimeSeasonScore: '',
  });
  await new AccountRepository().createAltAccount('602437624791040037', '879052998792319007', {
    allyCode: '242965143',
    name: 'Armis Alt 2',
    playerId: '987654321',
    rosterUnit: [],
    playerRating: [],
    profileStat: [],
    pvpProfile: [],
    unlockedPlayerTitle: [],
    unlockedPlayerPortrait: [],
    seasonStatus: [],
    datacron: [],
    selectedPlayerTitle: undefined,
    selectedPlayerPortrait: undefined,
    level: 85,
    guildId: '',
    guildName: '',
    guildLogoBackground: '',
    guildBannerColor: '',
    guildBannerLogo: '',
    guildTypeId: '',
    localTimeZoneOffsetMinutes: 0,
    lastActivityTime: undefined,
    lifetimeSeasonScore: '',
  });
};

seedDatabase();
