import { IServer } from "./server-table-interface";

export interface ILimits {
    serverId: string;
    ticketLimit: number;
    strikeLimit: number;
    createdDate: Date;
    updatedDate: Date;
    server: IServer;
  }
  