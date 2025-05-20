import { CreationAttributes, FindOptions } from 'sequelize';
import { BaseRepository } from './base-repository';
import { Member } from '../../../db/models';
import { Logger } from '../../logger';

export class MemberRepository extends BaseRepository<Member> {
  constructor() {
    super(Member);
  }

  async createMember(serverId: string, data: CreationAttributes<Member>): Promise<Member> {
    try {
      Logger.info(`Creating member for Server ID: ${serverId}`);
      const result = await this.create({ serverId, ...data });
      Logger.info(`Successfully created member for Server ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error creating member for Server ID: ${serverId}`, { error });
      throw error;
    }
  }

  async findAllServerMembers(serverId: string, options?: FindOptions): Promise<Member[]> {
    try {
      Logger.info(`Fetching all members for Server ID: ${serverId}`);
      const result = await this.findAll({ where: { serverId }, ...options });
      Logger.info(`Successfully fetched ${result.length} members for Server ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error fetching members for Server ID: ${serverId}`, { error });
      throw error;
    }
  }

  async findServerMember(serverId: string, discordId: string, options?: FindOptions): Promise<Member | null> {
    try {
      Logger.info(`Fetching member with Discord ID: ${discordId} for Server ID: ${serverId}`);
      const result = await this.findOneByCriteria({ serverId, discordId }, options);
      Logger.info(`Successfully fetched member with Discord ID: ${discordId} for Server ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error fetching member with Discord ID: ${discordId} for Server ID: ${serverId}`, { error });
      throw error;
    }
  }

  async updateAbsenceStatus(memberRecord: Member, isAbsent: boolean): Promise<[number]> {
    try {
      Logger.info(`Updating absence status for Member ID: ${memberRecord.memberId}`);
      const result = await this.update({ absent: isAbsent }, { where: { memberId: memberRecord.memberId } });
      Logger.info(`Successfully updated absence status for Member ID: ${memberRecord.memberId}`);
      return result;
    } catch (error) {
      Logger.error(`Error updating absence status for Member ID: ${memberRecord.memberId}`, { error });
      throw error;
    }
  }
}
