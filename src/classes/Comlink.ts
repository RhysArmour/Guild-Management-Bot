import axios, { AxiosRequestConfig } from 'axios';
import { PlayerData } from '../interfaces/comlink/playerData';
import { GuildData } from '../interfaces/comlink/guildData';
import { Logger } from '../logger';

interface requestData {
  id: string;
  route: string;
  method: string;
}

export class Comlink {
  static baseUrl = 'http://localhost:3000/';

  /**
   * Prepare the request configuration for axios.
   * @param data - The request data (route, ID, method)
   * @param payload - The payload to send in the request body
   * @returns AxiosRequestConfig
   */
  private static async prepareRequestConfig(data: requestData, payload: object): Promise<AxiosRequestConfig> {
    Logger.info(`Preparing request configuration for route: ${data.route}, ID: ${data.id}`);
    const config: AxiosRequestConfig = {
      method: data.method,
      url: `${this.baseUrl}${data.route}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(payload), // Serialize payload as JSON
    };

    Logger.info(`Request configuration prepared: ${JSON.stringify(config)}`);
    return config;
  }

  /**
   * Format the ally code by removing dashes.
   * @param allyCode - The ally code to format
   * @returns Formatted ally code
   */
  private static formatAllyCode(allyCode: string): string {
    Logger.info(`Formatting ally code: ${allyCode}`);
    const formattedCode = allyCode.replace(/-/g, '');
    Logger.info(`Formatted ally code: ${formattedCode}`);
    return formattedCode;
  }

  /**
   * Fetch player data by ally code.
   * @param allyCode - The ally code of the player
   * @returns PlayerData
   */
  static async getPlayerByAllyCode(allyCode: string): Promise<PlayerData> {
    Logger.info(`Fetching player data for Ally Code: ${allyCode}`);
    const formattedAllyCode = this.formatAllyCode(allyCode);

    try {
      const payload = {
        payload: {
          allyCode: formattedAllyCode,
        },
        enums: false,
      };
      const config = await this.prepareRequestConfig(
        { id: formattedAllyCode, method: 'post', route: 'player' },
        payload,
      );
      Logger.info(`Sending request to fetch player data with config: ${JSON.stringify(config)}`);
      const result = await axios(config).then((response) => response.data);
      Logger.info(`Player data retrieved successfully for Ally Code: ${result.allyCode}`);
      return result;
    } catch (error) {
      Logger.error(`Error fetching player data for Ally Code: ${formattedAllyCode}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch guild information by guild ID.
   * @param guildId - The guild ID
   * @returns GuildData
   */
  static async getGuildDataByGuildId(guildId: string): Promise<GuildData> {
    Logger.info(`Fetching guild info for Guild ID: ${guildId}`);

    try {
      const payload = {
        payload: {
          guildId,
          includeRecentGuildActivityInfo: true,
        },
        enums: false,
      };
      const config = await this.prepareRequestConfig({ id: guildId, method: 'post', route: 'guild' }, payload);
      Logger.info(`Sending request to fetch guild info with config: ${JSON.stringify(config)}`);
      const result = await axios(config).then((response) => response.data);
      Logger.info(`Guild info retrieved successfully for Guild ID: ${guildId}`);
      return result;
    } catch (error) {
      Logger.error(`Error fetching guild info for Guild ID: ${guildId}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch guild tickets by guild ID.
   * @param guildId - The guild ID
   * @returns Array of guild ticket data
   */
  static async getGuildTickets(guildId: string) {
    Logger.info(`Fetching guild tickets for Guild ID: ${guildId}`);

    try {
      const payload = {
        payload: {
          guildId,
          includeRecentGuildActivityInfo: true,
        },
        enums: false,
      };
      const config = await this.prepareRequestConfig({ id: guildId, method: 'post', route: 'guild' }, payload);
      Logger.info(`Sending request to fetch guild tickets with config: ${JSON.stringify(config)}`);
      const result: Array<{
        playerName: string;
        playerId: string;
        tickets: number;
        lifetimeTickets: number;
      }> = [];

      await axios(config).then((response) => {
        Logger.info(`Processing guild ticket data for Guild ID: ${guildId}`);
        for (const member of response.data.guild.member) {
          const { currentValue, lifetimeValue } = member.memberContribution.find((entry) => entry.type === 2);
          result.push({
            playerName: member.playerName,
            playerId: member.playerId,
            tickets: currentValue,
            lifetimeTickets: lifetimeValue,
          });
        }
      });

      Logger.info(`Guild tickets retrieved successfully for Guild ID: ${guildId}`);
      return result;
    } catch (error) {
      Logger.error(`Error fetching guild tickets for Guild ID: ${guildId}. Error: ${error}`);
      throw error;
    }
  }
}
