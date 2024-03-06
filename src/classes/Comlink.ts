import axios from 'axios';
import { PlayerData } from '../interfaces/comlink/playerData';
import { GuildData } from '../interfaces/comlink/guildData';
// import { Logger } from '../logger';

interface requestData {
  id: string;
  route: string;
  method: string;
}

export class Comlink {
  static baseUrl = 'http://localhost:3000/';
  private static async sortRequestConfig(data: requestData) {
    let payloadData;
    let config;
    if (data.route === 'guild') {
      payloadData = JSON.stringify({
        payload: {
          guildId: data.id,
          includeRecentGuildActivityInfo: true,
        },
        enums: false,
      });
      config = {
        method: data.method,
        url: this.baseUrl + data.route,
        headers: {
          'Content-Type': 'application/json',
        },
        data: payloadData,
      };
    }
    if (data.route === 'player') {
      payloadData = JSON.stringify({
        payload: {
          allyCode: data.id,
        },
        enums: false,
      });
      config = {
        method: data.method,
        url: this.baseUrl + data.route,
        headers: {
          'Content-Type': 'application/json',
        },
        data: payloadData,
      };
    }
    return config;
  }

  private static formatAllyCode(allyCode: string) {
    return allyCode.replace(/-/g, '');
  }

  static async getPlayerByAllyCode(allyCode: string): Promise<PlayerData> {
    const formattedAllyCode = this.formatAllyCode(allyCode);
    const config = await this.sortRequestConfig({ id: formattedAllyCode, method: 'post', route: 'player' });
    const result = await axios(config).then(function (response) {
      return response.data;
    });
    return result;
  }

  static async getGuildInfoByGuildId(guildId: string): Promise<GuildData> {
    const config = await this.sortRequestConfig({ id: guildId, method: 'post', route: 'guild' });
    const result = await axios(config).then(function (response) {
      return response.data;
    });
    return result;
  }

  static async getGuildTickets(guildId: string) {
    const config = await this.sortRequestConfig({ id: guildId, method: 'post', route: 'guild' });
    const result: Array<{
      playerName: string;
      playerId: string;
      tickets: number;
      lifetimeTickets: number;
    }> = [];
    await axios(config).then(function (response) {
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
    return result;
  }
}

