import { addStrike } from '../../../src/methods/add-strike';
import { MemberTableServices } from '../../../src/database/services/member-services';
import { StrikeValuesTableService } from '../../../src/database/services/strike-values-services';
import { StrikeReasonsServices } from '../../../src/database/services/strike-reason-services';
import { ChannelTableService } from '../../../src/database/services/channel-services';
import { MockMemberAddStrikeSuccess, mockMember } from '../../mocks/model-mocks/members-table-mocks';
import { mockAddStrikeCommandInteraction, mockStrikeChannel } from '../../mocks/discordjs.mocks';
import { mockChannelsTableSuccess } from '../../mocks/model-mocks/channel-table-mocks';
import { mockMemberAddStrikeReasonsSuccess } from '../../mocks/model-mocks/strike-reason-mocks';

jest.mock('../../../src/database/services/member-services');
jest.mock('../../../src/database/services/strike-values-services');
jest.mock('../../../src/database/services/strike-reason-services');
jest.mock('../../../src/database/services/channel-services');

const mockedMemberTableServices = MemberTableServices as jest.Mocked<typeof MemberTableServices>;
const mockedStrikeValuesTableService = StrikeValuesTableService as jest.Mocked<typeof StrikeValuesTableService>;
const mockedStrikeReasonsServices = StrikeReasonsServices as jest.Mocked<typeof StrikeReasonsServices>;
const mockedChannelTableService = ChannelTableService as jest.Mocked<typeof ChannelTableService>;

describe('addStrike', () => {
  beforeEach(() => {
    // Set up mock data and clear mock calls before each test
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    test('When addStrike is called with a valid interaction, it returns successfully', async () => {
      // Arrange
      mockedChannelTableService.getChannelsByServerId.mockResolvedValue(mockChannelsTableSuccess);
      mockedMemberTableServices.createMemberWithMember.mockResolvedValue(mockMember);
      mockedStrikeValuesTableService.getIndividualStrikeValueByInteraction.mockResolvedValue(1);
      mockedMemberTableServices.addMemberStrikesWithMember.mockResolvedValue(MockMemberAddStrikeSuccess);
      mockedStrikeReasonsServices.createStrikeReasonByMember.mockResolvedValue(mockMemberAddStrikeReasonsSuccess);

      // Act
      const result = await addStrike(mockAddStrikeCommandInteraction);

      // Assert
      expect(result).toEqual({
        message: 'strikes successfully added',
        content: '- :x: has been added to <@1> - Ticket Strike.\n   - TestDisplayName now has 1 strikes :x:\n\n',
      });

      expect(mockAddStrikeCommandInteraction.followUp).toHaveBeenCalledWith({
        content: expect.any(String),
        ephemeral: true,
      });

      expect(mockStrikeChannel.send).toHaveBeenCalledWith(expect.any(String));
    });
  });
});

