import { CommandInteraction, GuildMember, InteractionType, Snowflake, TextChannel, User } from 'discord.js';
// import { mockMember } from './model-mocks/members-table-mocks';

export const mockTicketChannel = {
  send: jest.fn(),
  id: '123' as Snowflake,
} as unknown as TextChannel;

export const mockStrikeChannel = {
  send: jest.fn(),
  id: '456' as Snowflake,
} as unknown as TextChannel;

export const mockUser: User = {
  id: '1',
  username: 'TestUsername',
} as unknown as User;

export const mockGuildMember: GuildMember = {
  avatar: 'TestAvatar',
  nickname: 'TestNickname',
  displayName: 'TestDisplayName',
  id: '1',
  user: mockUser,
} as unknown as GuildMember;

export const mockAddStrikeCommandInteraction = {
  type: InteractionType.ApplicationCommand, // InteractionType.ApplicationCommand
  isChatInputCommand: jest.fn(() => true),
  guild: {
    channels: {
      cache: new Map([
        [mockStrikeChannel.id, mockStrikeChannel],
        [mockTicketChannel.id, mockTicketChannel],
      ]),
    },
  },
  guildId: '1234567890' as Snowflake,
  options: {
    data: [
      { type: 6, name: 'user1', value: '123' },
      { type: 3, name: 'reason1', value: 'Ticket Strike' },
    ],
    getMember: jest.fn(() => mockGuildMember),
    get: jest.fn(() => {
      return {
        value: 'Ticket Strike',
      };
    }),
  },
  followUp: jest.fn(),
  reply: jest.fn(),
} as unknown as CommandInteraction;

//   guildMember = {
//     id: '123',
//     displayName: 'TestUser',
//     roles: {
//       cache: new Map(),
//     },
//   } as unknown as GuildMember;

//   Object.defineProperty(interaction, 'guild', {
//     value: {
//       channels: {
//         cache: new Map([[textChannel.id, textChannel]]),
//       },
//     },
//     writable: true,
//   });

