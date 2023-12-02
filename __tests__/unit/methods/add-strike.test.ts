import { CommandInteraction, Guild, GuildMember, Snowflake, TextChannel } from 'discord.js';
import { addStrike } from '../../../src/methods/add-strike';
import { MemberTableServices } from '../../../src/database/services/member-services';
import { StrikeValuesTableService } from '../../../src/database/services/strike-values-services';
import { StrikeReasonsServices } from '../../../src/database/services/strike-reason-services';
import { ChannelTableService } from '../../../src/database/services/channel-services';
import { MockGuildMembersTableSuccess } from '../../mocks/members-table-mocks';

jest.mock('../../../src/database/services/member-services');
jest.mock('../../../src/database/services/strike-values-services');
jest.mock('../../../src/database/services/strike-reason-services');
jest.mock('../../../src/database/services/channel-services');

const mockedMemberTableServices = MemberTableServices as jest.Mocked<typeof MemberTableServices>;
const mockedStrikeValuesTableService = StrikeValuesTableService as jest.Mocked<typeof StrikeValuesTableService>;
const mockedStrikeReasonsServices = StrikeReasonsServices as jest.Mocked<typeof StrikeReasonsServices>;
const mockedChannelTableService = ChannelTableService as jest.Mocked<typeof ChannelTableService>;

let interaction: CommandInteraction;
let guildMember: GuildMember;
let textChannel: TextChannel;
describe('addStrike', () => {
  beforeEach(() => {
    // Set up mock data and clear mock calls before each test
    jest.clearAllMocks();
    interaction = {
      type: 1, // InteractionType.ApplicationCommand
      isChatInputCommand: jest.fn(),
      guildId: '1234567890' as Snowflake,
      options: {
        data: [
          { type: 6, name: 'user1', value: '123' },
          { type: 3, name: 'reason1', value: 'Ticket Strike' },
        ],
      },
      followUp: jest.fn(),
    } as unknown as CommandInteraction;

    guildMember = {
      id: '123',
      displayName: 'TestUser',
      roles: {
        cache: new Map(),
      },
    } as unknown as GuildMember;

    textChannel = {
      send: jest.fn(),
      id: '456' as Snowflake,
    } as unknown as TextChannel;

    Object.defineProperty(interaction, 'guild', {
      value: {
        channels: {
          cache: new Map([[textChannel.id, textChannel]]),
        },
      },
      writable: true,
    });
  });

  describe('Happy Path', () => {
    test('When addStrike is called with a valid interaction, it returns successfully', async () => {
      // Arrange
      mockedMemberTableServices.getMemberWithMember.mockResolvedValue(undefined);
      mockedMemberTableServices.createMemberWithMember.mockResolvedValueOnce(
        Promise.resolve(MockGuildMembersTableSuccess),
      );
      mockedStrikeValuesTableService.getIndividualStrikeValueByInteraction.mockResolvedValue({ value: 1 } as any);
      mockedMemberTableServices.addMemberStrikesWithMember.mockResolvedValue({ strikes: 1 } as any);
      mockedStrikeReasonsServices.createStrikeReasonByMember.mockResolvedValue({} as any);

      // Act
      const result = await addStrike(interaction);

      // Assert
      expect(result).toEqual({ message: '', content: undefined });

      expect(interaction.followUp).toHaveBeenCalledWith({
        content: expect.any(String),
        ephemeral: true,
      });

      expect(textChannel.send).toHaveBeenCalledWith(expect.any(String));
    });
  });
});

