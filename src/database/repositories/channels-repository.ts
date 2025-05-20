import { BaseRepository } from './base-repository';
import { Channels } from '../../../db/models/channels';
import { CreationAttributes, FindOptions } from 'sequelize';
import { IGuildChannels } from '../../interfaces/methods/bot-setup';
import { Logger } from '../../logger';

export class ChannelRepository extends BaseRepository<Channels> {
  constructor() {
    super(Channels);
  }

  async createChannels(serverId: string, data: CreationAttributes<Channels>): Promise<Channels | null> {
    try {
      Logger.info(`Creating channels for Server ID: ${serverId}`);
      const result = await this.create({ serverId, ...data });
      Logger.info(`Successfully created channels for Server ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error creating channels for Server ID: ${serverId}`, { error });
      throw error;
    }
  }

  async findChannels(serverId: string, options?: FindOptions): Promise<Channels | null> {
    try {
      Logger.info(`Finding channels for Server ID: ${serverId}`);
      const result = await this.findOneByCriteria({ serverId }, options);
      Logger.info(`Successfully found channels for Server ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error finding channels for Server ID: ${serverId}`, { error });
      throw error;
    }
  }

  async updateChannels(serverId: string, data: IGuildChannels): Promise<[number]> {
    try {
      Logger.info(`Updating channels for Server ID: ${serverId}`);
      const result = await this.update(
        {
          strikeChannelId: data.strikeChannel.id,
          strikeChannelName: data.strikeChannel.name,
          notificationChannelId: data.notificationChannel.id,
          notificationChannelName: data.notificationChannel.name,
          strikeLimitChannelId: data.strikeLimitChannel.id,
          strikeLimitChannelName: data.strikeLimitChannel.name,
        },
        { where: { serverId } },
      );
      Logger.info(`Successfully updated channels for Server ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error updating channels for Server ID: ${serverId}`, { error });
      throw error;
    }
  }
}
