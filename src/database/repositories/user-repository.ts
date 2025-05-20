import { CreationAttributes, FindOptions } from 'sequelize';
import { BaseRepository } from './base-repository';
import { DiscordUser } from '../../../db/models/user';
import { Logger } from '../../logger';

export class DiscordUserRepository extends BaseRepository<DiscordUser> {
  constructor() {
    super(DiscordUser);
  }

  /**
   * Create a DiscordUser.
   * @param data - The user's creation data
   */
  async createUser(data: CreationAttributes<DiscordUser>): Promise<DiscordUser> {
    try {
      Logger.info(`Creating DiscordUser with data: ${JSON.stringify(data)}`);
      const result = await this.create({ ...data });
      Logger.info(`Successfully created DiscordUser with ID: ${result.discordId}`);
      return result;
    } catch (error) {
      Logger.error(`Error creating DiscordUser with data: ${JSON.stringify(data)}`, { error });
      throw error;
    }
  }

  /**
   * Find a DiscordUser by their Discord ID.
   * @param discordId - The unique Discord ID
   * @param options - Sequelize find options
   */
  async findByDiscordId(discordId: string, options?: FindOptions): Promise<DiscordUser | null> {
    try {
      Logger.info(`Finding DiscordUser with Discord ID: ${discordId}`);
      const result = await this.findById(discordId, options);
      if (!result) {
        Logger.warn(`No DiscordUser found with Discord ID: ${discordId}`);
      } else {
        Logger.info(`Successfully found DiscordUser with Discord ID: ${discordId}`);
      }
      return result;
    } catch (error) {
      Logger.error(`Error finding DiscordUser with Discord ID: ${discordId}`, { error });
      throw error;
    }
  }
}
