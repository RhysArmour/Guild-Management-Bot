import { Logger } from '../logger';
import { Comlink } from '../classes/Comlink';
import { Server } from '../../db/models';

interface PlayerInfo {
  playerId: string;
  playerName: string;
}

export const getMembersWhoAreUnregistered = async (server: Server) => {
  try {
    const playerIds: PlayerInfo[] = [];
    const registeredPlayerIds: string[] = [];

    Logger.info('Fetching Guild Info from Comlink');
    const guildMembers = (await Comlink.getGuildDataByGuildId(server.guild.guildId)).guild.member;

    Logger.info('Sorting PlayerIds');
    for (const member of guildMembers) {
      playerIds.push({ playerId: member.playerId, playerName: member.playerName });
    }

    Logger.info('Checking currently registered Members');
    for (const member of server.members) {
      for (const account of member.accounts) {
        if (account.playerId) {
          registeredPlayerIds.push(account.playerId);
        }
      }
    }

    Logger.info('Filtering Unregistered Members');
    const unregisteredMembers = playerIds.filter((member) => !registeredPlayerIds.includes(member.playerId));

    let formattedUnregisteredMembers: string = '';

    Logger.info('Formatting Response');
    for (const member of unregisteredMembers) {
      formattedUnregisteredMembers += `${member.playerName}\n`;
    }

    Logger.info('Returning Formatted Response');
    return formattedUnregisteredMembers;
  } catch (error) {
    Logger.error(`Error in who is unregistered: ${error}`);
    throw new Error('Failed to check unregistered members');
  }
};
