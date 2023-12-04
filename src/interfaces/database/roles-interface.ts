import { IServer } from './server-table-interface';

export interface IRoles {
  serverId: string;
  guildRoleId: string;
  guildRoleName: string;
  absenceRoleId: string;
  absenceRoleName: string;
  strikeLimitRoleId: string;
  strikeLimitRoleName: string;
  createdDate: Date;
  updatedDate: Date;
  server: IServer;
}
