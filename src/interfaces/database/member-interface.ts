import { IMemberStrikeReasons } from './member-strike-reasons-interface';

export interface IMember {
  uniqueId: string;
  serverId: string;
  serverName: string;
  memberId: string;
  name: string;
  username: string;
  strikes: number;
  strikeReasons?: IMemberStrikeReasons[];
  lifetimeStrikes: number;
  absent: boolean;
  currentAbsenceStartDate: Date;
  totalAbsenceDuration: number;
  createdDate: Date;
  updatedDate: Date;
}

