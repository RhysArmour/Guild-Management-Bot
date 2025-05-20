import { BaseRepository } from './base-repository';
import { Guild } from '../../../db/models/guild';
import { Comlink } from '../../classes/Comlink';
import { Logger } from '../../logger';
import moment from 'moment';
import { GuildData } from '../../interfaces/comlink/guildData';
import { Account, Channels, Member, Roles, Server, Strikes } from '../../../db';
import { literal } from 'sequelize';

export class GuildRepository extends BaseRepository<Guild> {
  constructor() {
    super(Guild);
  }

  private roundToNearest30Minutes(date: Date): Date {
    const rounded = new Date(date);
    const minutes = date.getMinutes();
    if (minutes < 15) {
      rounded.setMinutes(0, 0, 0);
    } else if (minutes < 45) {
      rounded.setMinutes(30, 0, 0);
    } else {
      rounded.setHours(date.getHours() + 1, 0, 0, 0);
    }
    return rounded;
  }

  async createGuild(serverId: string, guild: GuildData): Promise<Guild | null> {
    try {
      Logger.info(`Creating guild with ID: ${guild.guild.profile.id} for Server ID: ${serverId}`);
      const existingGuild = await this.findById(guild.guild.profile.id);

      if (existingGuild) {
        Logger.warn(`Guild already exists and is associated to server ${existingGuild.server.serverName}`);
        throw new Error(`Guild already exists and is associated to server ${existingGuild.server.serverName}`);
      }

      const guildResetTimestamp = parseInt(guild.guild.nextChallengesRefresh); // UNIX timestamp
      const guildResetDate = new Date(guildResetTimestamp * 1000); // Convert to milliseconds
      const guildResetTimeUTC = guildResetDate.toLocaleTimeString('en-US'); // Extract HH:mm:ss in UTC

      Logger.info(`Parsed Guild Reset Time (UTC): ${guildResetTimeUTC}`);

      const result = await this.create({
        guildId: guild.guild.profile.id,
        guildName: guild.guild.profile.name,
        guildResetTime: guildResetDate, // Store the full date in the database
        galacticPower: parseInt(guild.guild.profile.guildGalacticPower),
        serverId,
      });

      Logger.info(`Successfully created guild with ID: ${guild.guild.profile.id} for Server ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error creating guild with ID: ${guild.guild.profile.id} for Server ID: ${serverId}`, { error });
      throw error;
    }
  }

  async findByGuildId(serverId: string): Promise<Guild | null> {
    try {
      Logger.info(`Fetching guild for Server ID: ${serverId}`);
      const result = await this.findOneByCriteria({ serverId });
      Logger.info(`Successfully fetched guild for Server ID: ${serverId}`);
      return result;
    } catch (error) {
      Logger.error(`Error fetching guild for Server ID: ${serverId}`, { error });
      throw error;
    }
  }

  async findGuildResetTimes(): Promise<Guild[]> {
    try {
      Logger.info(`Fetching guild reset times`);
      const result: Guild[] = [];
      const roundedNow = this.roundToNearest30Minutes(new Date());
      const roundedHours = roundedNow.getUTCHours();
      const roundedMinutes = roundedNow.getUTCMinutes();
      const timeString = `${roundedHours}:${roundedMinutes}`;

      const guildRecords: Guild[] = await Guild.findAll({
        where: literal(`TO_CHAR("guild_reset_time", 'HH24:MI') = '${timeString}'`),
        include: [
          {
            model: Server,
            as: 'server',
            include: [
              { model: Channels, as: 'channels' },
              { model: Roles, as: 'roles' },
              { model: Member, as: 'members', include: [{ model: Account, as: 'accounts' }] },
              { model: Strikes, as: 'strikes' },
            ],
          },
        ],
      });

      for (const guild of guildRecords) {
        if (!guild.guildResetTime) continue;
        const resetTime = guild.guildResetTime;
        if (resetTime.getUTCHours() === roundedHours && resetTime.getUTCMinutes() === roundedMinutes) {
          result.push(guild);
        }
      }

      Logger.info(`Successfully fetched guild reset times`);
      return result;
    } catch (error) {
      Logger.error(`Error fetching guild reset times`, { error });
      throw error;
    }
  }

  async updateResetTime(guild: Guild): Promise<number[]> {
    try {
      Logger.info(`Updating reset time for Guild ID: ${guild.guildId}`);
      const newTime = moment(guild.guildResetTime).add(24, 'hours').valueOf();
      const result = await this.update({ guildResetTime: new Date(newTime) }, { where: { guildId: guild.guildId } });
      Logger.info(`Successfully updated reset time for Guild ID: ${guild.guildId}`);
      return result;
    } catch (error) {
      Logger.error(`Error updating reset time for Guild ID: ${guild.guildId}`, { error });
      throw error;
    }
  }

  async updateGuildData(guild: Guild): Promise<Guild | null> {
    try {
      Logger.info(`Updating guild data for Guild ID: ${guild.guildId}`);

      const guildData = await Comlink.getGuildDataByGuildId(guild.guildId);

      if (!guildData) {
        Logger.error(`No data found in Comlink for guild: ${guild.guildId}`);
        throw new Error(`No data found in Comlink for guild: ${guild.guildId}`);
      }

      await this.update(
        {
          guildName: guildData.guild.profile.name,
          galacticPower: parseInt(guildData.guild.profile.guildGalacticPower),
          guildResetTime: new Date(parseFloat(guildData.guild.nextChallengesRefresh) * 1000),
        },
        { where: { guildId: guild.guildId } },
      );
      Logger.info(`Successfully updated guild data for Guild ID: ${guild.guildId}`);
      const updatedGuild = await this.findById(guild.guildId);
      return updatedGuild;
    } catch (error) {
      Logger.error(`Error updating guild data for Guild ID: ${guild.guildId}`, { error });
      throw error;
    }
  }

  async findAllGuilds(): Promise<Guild[]> {
    try {
      Logger.info(`Fetching all guilds`);
      const result = await this.findAll({}, { include: [{ model: Server, as: 'server' }] });
      Logger.info(`Successfully fetched all guilds`);
      return result;
    } catch (error) {
      Logger.error(`Error fetching all guilds`, { error });
      throw error;
    }
  }
}
