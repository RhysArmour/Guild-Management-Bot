import { FindOptions, InferAttributes } from 'sequelize';
import { BaseRepository } from './base-repository';
import { Server } from '../../../db/models/server';
import { Logger } from '../../logger';
import { Account, Channels, Guild, Member, Roles, Strikes } from '../../../db';
import { GuildRepository } from './guild-repository';
import { ChannelRepository } from './channels-repository';
import { RoleRepository } from './roles-repository';
import { GuildData } from '../../interfaces/comlink/guildData';

export class ServerRepository extends BaseRepository<Server> {
  constructor() {
    super(Server);
  }

  async createServer(serverId: string, data: Partial<Server>, guildData: GuildData): Promise<Server | null> {
    try {
      Logger.info(`Creating server with ID: ${serverId}`);
      await this.create({ serverId, ...data });

      await new ChannelRepository().createChannels(serverId, {
        serverId,
      });

      await new RoleRepository().createRoles(serverId, {
        serverId,
      });

      await new GuildRepository().createGuild(serverId, guildData);

      const result = await this.findServer(serverId);

      Logger.info(`Successfully created server with ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error creating server with ID: ${serverId}`, { error });
      throw error;
    }
  }

  async findServer(serverId: string, options?: FindOptions<InferAttributes<Server>>): Promise<Server | null> {
    try {
      Logger.info(`Finding server with ID: ${serverId}`);
      const result = await this.findById(serverId, {
        include: [
          { model: Channels, as: 'channels' },
          { model: Guild, as: 'guild' },
          {
            model: Member,
            as: 'members',
            include: [{ model: Account, as: 'accounts', include: [{ model: Strikes, as: 'strikes' }] }],
          },
          { model: Roles, as: 'roles' },
          { model: Strikes, as: 'strikes' },
        ],
        ...options,
      });
      Logger.info(`Successfully found server with ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error finding server with ID: ${serverId}`, { error });
      throw error;
    }
  }

  async findAllServers(flagKey: keyof Server, flagValue: unknown, options?: FindOptions): Promise<Server[]> {
    try {
      Logger.info(`Finding all servers where ${flagKey} = ${flagValue}`);
      const result = await this.findAll({ where: { [flagKey]: flagValue }, ...options });
      Logger.info(`Successfully found ${result.length} servers where ${flagKey} = ${flagValue}`);
      return result;
    } catch (error) {
      Logger.error(`Error finding servers where ${flagKey} = ${flagValue}`, { error });
      throw error;
    }
  }

  async updateServer(serverId: string, config: Partial<Server>): Promise<[number]> {
    try {
      Logger.info(`Updating server with ID: ${serverId}`);
      const options = { where: { id: serverId } };
      const result = await this.update(config, options);
      Logger.info(`Successfully updated server with ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error updating server with ID: ${serverId}`, { error });
      throw error;
    }
  }

  async getStrikeResetPeriod(serverId: string): Promise<string | null> {
    try {
      Logger.info(`Fetching strike reset period for Server ID: ${serverId}`);
      const server = await this.findServer(serverId);
      if (!server) {
        Logger.warn(`Server with ID ${serverId} not found when fetching strike reset period.`);
        return null;
      }
      Logger.info(`Successfully fetched strike reset period for Server ID: ${serverId}`);
      return server.dataValues.strikeResetPeriod;
    } catch (error) {
      Logger.error(`Error fetching strike reset period for Server ID: ${serverId}`, { error });
      throw error;
    }
  }
}
