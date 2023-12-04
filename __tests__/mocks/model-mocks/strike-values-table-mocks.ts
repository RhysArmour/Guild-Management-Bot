import { MockServerTableSuccess } from './server-table-mocks';

// MockGuildStrikeValuesSuccess.ts
export const MockGuildStrikeValuesSuccess = {
  serverId: '1',
  uniqueId: '123',
  strikeReason: 'Sample Reason',
  value: 2,
  createdDate: new Date('2023-01-01T00:00:00.000Z'),
  updatedDate: new Date('2023-01-01T00:00:00.000Z'),
  server: MockServerTableSuccess,
};

// MockGuildStrikeValuesNoServerId.ts
export const MockGuildStrikeValuesNoServerId = {
  uniqueId: '123',
  strikeReason: 'Sample Reason',
  value: 2,
  createdDate: '2023-01-01T00:00:00.000Z',
  updatedDate: '2023-01-01T00:00:00.000Z',
};

