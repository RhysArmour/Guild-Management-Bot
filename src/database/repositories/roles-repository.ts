import { BaseRepository } from './base-repository';
import { Roles } from '../../../db/models/roles';
import { CreationAttributes, FindOptions } from 'sequelize';
import { IGuildRoles } from '../../interfaces/methods/bot-setup';
import { Logger } from '../../logger';

export class RoleRepository extends BaseRepository<Roles> {
  constructor() {
    super(Roles);
  }

  async createRoles(serverId: string, data: CreationAttributes<Roles>): Promise<Roles | null> {
    try {
      Logger.info(`Creating roles for Server ID: ${serverId}`);
      const result = await this.create({ serverId, ...data });
      Logger.info(`Successfully created roles for Server ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error creating roles for Server ID: ${serverId}`, { error });
      throw error;
    }
  }

  async getRoles(serverId: string, options?: FindOptions): Promise<Roles | null> {
    try {
      Logger.info(`Fetching roles for Server ID: ${serverId}`);
      const result = await this.findOneByCriteria({ serverId }, options);
      Logger.info(`Successfully fetched roles for Server ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error fetching roles for Server ID: ${serverId}`, { error });
      throw error;
    }
  }

  async updateRoles(serverId: string, data: IGuildRoles): Promise<[number]> {
    try {
      Logger.info(`Updating roles for Server ID: ${serverId}`);
      const { absenceRole, guildRole, strikeLimitRole } = data;
      const result = await this.update(
        {
          absenceRoleId: absenceRole.id,
          absenceRoleName: absenceRole.name,
          guildRoleId: guildRole.id,
          guildRoleName: guildRole.name,
          strikeLimitRoleId: strikeLimitRole.id,
          strikeLimitRoleName: strikeLimitRole.name,
        },
        { where: { serverId } },
      );
      Logger.info(`Successfully updated roles for Server ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error updating roles for Server ID: ${serverId}`, { error });
      throw error;
    }
  }
}
