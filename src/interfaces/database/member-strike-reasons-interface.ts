import { IMember } from "./member-interface";

export interface IMemberStrikeReasons {
  id: number;
  serverId: string;
  name: string;
  uniqueId: string;
  date: Date;
  reason: string;
  member: IMember;
}
