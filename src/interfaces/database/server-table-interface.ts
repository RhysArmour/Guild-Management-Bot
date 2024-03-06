import { IChannels } from './channels-interface';
import { ILimits } from './limits-interface';
import { IMember } from './member-interface';
import { IRoles } from './roles-interface';
import { IStrikeValues } from './strike-values-interface';
import { Prisma } from '@prisma/client';

export type ServerWithRelations = Prisma.ServerTableGetPayload<{
  include: {
    channels: true;
    guildStrikes: true;
    limits: true;
    members: true;
    roles: true;
  };
}>;

export interface IServer {
  serverId: string;
  serverName: string;
  strikeResetPeriod: number;
  lastStrikeReset?: Date | null;
  triggerPhrase?: string | null;
  createdDate: Date;
  updatedDate: Date;
  members: IMember[];
  channels?: IChannels | null;
  guildStrikes: IStrikeValues[];
  limits?: ILimits | null;
  roles?: IRoles | null;
}

