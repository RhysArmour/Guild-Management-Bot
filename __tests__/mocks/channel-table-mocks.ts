import { ServerTablePayload } from '@prisma/client';

// MockServerTableSuccess.ts
export const MockServerTableSuccess: ServerTablePayload = {
  serverId: '1',
  serverName: 'Sample Server',
  strikeResetPeriod: 1,
  lastStrikeReset: null,
  triggerPhrase: null,
  createdDate: '2023-01-01T00:00:00.000Z',
  updatedDate: '2023-01-01T00:00:00.000Z',
};

// MockServerTableNoServerId.ts
export const MockServerTableNoServerId = {
  serverName: 'Sample Server',
  strikeResetPeriod: 1,
  lastStrikeReset: null,
  triggerPhrase: null,
  createdDate: '2023-01-01T00:00:00.000Z',
  updatedDate: '2023-01-01T00:00:00.000Z',
};
