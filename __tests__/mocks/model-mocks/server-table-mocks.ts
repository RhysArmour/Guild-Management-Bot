import { IServer } from '../../../src/interfaces/database/server-table-interface';
import { mockMember } from './members-table-mocks';
import { MockGuildStrikeValuesSuccess } from './strike-values-table-mocks';

// MockServerTableSuccess.ts
export const MockServerTableSuccess: IServer = {
  serverId: '1',
  serverName: 'Sample Server',
  strikeResetPeriod: 1,
  lastStrikeReset: null,
  triggerPhrase: null,
  members: [mockMember],
  guildStrikes: [MockGuildStrikeValuesSuccess],
  createdDate: new Date('2023-01-01T00:00:00.000Z'),
  updatedDate: new Date('2023-01-01T00:00:00.000Z'),
};

