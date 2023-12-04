import { IServer } from "./server-table-interface";

export interface IStrikeValues {
    serverId: string;
    uniqueId: string;
    strikeReason: string;
    value: number;
    createdDate: Date;
    updatedDate: Date;
    server: IServer;
  }