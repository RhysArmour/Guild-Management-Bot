import { MockServerTableSuccess } from './server-table-mocks'; // Import the relevant server table model

export const mockChannelsTableSuccess = {
  serverId: 'mockServerId',
  strikeChannelName: 'mockStrikeChannelName',
  strikeChannelId: '456',
  strikeLimitChannelName: 'mockStrikeLimitChannelName',
  strikeLimitChannelId: 'mockStrikeLimitChannelId',
  ticketChannelName: 'mockTicketChannelName',
  ticketChannelId: '123',
  createdDate: new Date('2023-01-01T00:00:00.000Z'),
  updatedDate: new Date('2023-01-02T00:00:00.000Z'),
  server: MockServerTableSuccess,
};

