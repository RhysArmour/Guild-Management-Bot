import { FindOptions } from 'sequelize';
import { BaseRepository } from './base-repository';
import { Strikes } from '../../../db/models/strikes';
import { Account } from '../../../db/models/account';
import { Logger } from '../../logger';
import { Member } from '../../../db';

export class StrikeRepository extends BaseRepository<Strikes> {
  constructor() {
    super(Strikes);
  }

  async findAllByServer(serverId: string, options?: FindOptions): Promise<Strikes[]> {
    try {
      Logger.info(`Finding all strikes for Server ID: ${serverId}`);
      const result = await this.findAll({ where: { serverId }, ...options });
      Logger.info(`Successfully found ${result.length} strikes for Server ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error finding strikes for Server ID: ${serverId}`, { error });
      throw error;
    }
  }

  async findActiveStrikes(serverId: string, options?: FindOptions): Promise<Strikes[]> {
    try {
      Logger.info(`Finding active strikes with criteria: ${JSON.stringify(serverId)}`);
      const result = await this.findAll({
        where: { serverId, active: true },
        include: [
          { model: Member, as: 'member' },
          { model: Account, as: 'account' },
        ],
        ...options,
      });
      Logger.info(`Successfully found ${result.length} active strikes`);
      return result;
    } catch (error) {
      Logger.error(`Error finding active strikes with criteria: ${JSON.stringify(serverId)}`, { error });
      throw error;
    }
  }

  async createStrike(account: Account, reason: string, assignedDate?: Date): Promise<Strikes> {
    try {
      Logger.info(`Creating strike for Account Ally Code: ${account.allyCode}`);
      const result = await this.create({
        serverId: account.member.serverId,
        memberId: account.member.memberId,
        allyCode: account.allyCode,
        assignedDate: assignedDate ?? new Date(),
        active: true,
        reason,
        discordId: account.discordId,
      });
      Logger.info(`Successfully created strike for Account Ally Code: ${account.allyCode}`);
      return result;
    } catch (error) {
      Logger.error(`Error creating strike for Account Ally Code: ${account.allyCode}`, { error });
      throw error;
    }
  }
}
