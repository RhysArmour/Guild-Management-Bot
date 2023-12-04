import { IServer } from "./server-table-interface";

export interface IChannels {
  serverId: string;
  strikeChannelName: string;
  strikeChannelId: string;
  strikeLimitChannelName: string;
  strikeLimitChannelId: string;
  ticketChannelName: string;
  ticketChannelId: string;
  createdDate: Date;
  updatedDate: Date;
  server: IServer;
}
