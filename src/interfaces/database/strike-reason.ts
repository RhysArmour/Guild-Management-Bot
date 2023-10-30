import { Prisma } from '@prisma/client';

export interface IStrikeReasons extends Prisma.MemberStrikeReasonsUpdateInput {
  id?: string;
  uniqueId?: string;
  name?: string;
  date?: Date;
  reason?: string;
}
