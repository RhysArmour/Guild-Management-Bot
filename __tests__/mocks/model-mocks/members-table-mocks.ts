import { mockMemberAddStrikeReasonsSuccess } from "./strike-reason-mocks";

// MockGuildMembersTableSuccess.ts
export const mockMember = {
  uniqueId: '123',
  serverId: '1',
  serverName: 'Test Server',
  memberId: '456',
  name: 'TestMember',
  username: 'TestMemberUsername',
  strikes: 0,
  lifetimeStrikes: 3,
  absent: false,
  currentAbsenceStartDate: null,
  totalAbsenceDuration: null,
  createdDate: new Date('2023-01-01T00:00:00.000Z'),
  updatedDate: new Date('2023-01-01T00:00:00.000Z'),
};

// MockGuildMembersTableAddedStrike.ts
export const MockMemberAddStrikeSuccess = {
  uniqueId: '123',
  serverId: '1',
  serverName: 'Test Server',
  memberId: '456',
  name: 'TestMember',
  username: 'TestMemberUsername',
  strikes: 1,
  strikeReasons: [mockMemberAddStrikeReasonsSuccess],
  lifetimeStrikes: 4,
  absent: false,
  currentAbsenceStartDate: null,
  totalAbsenceDuration: null,
  createdDate: new Date('2023-01-01T00:00:00.000Z'),
  updatedDate: new Date('2023-01-01T00:00:00.000Z'),
};

