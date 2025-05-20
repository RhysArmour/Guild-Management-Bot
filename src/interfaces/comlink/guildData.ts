import { GuildMemberData } from './guildMemberData';
import { ProfileData } from './profileData';

export interface GuildData {
  guild: {
    member: [GuildMemberData];
    inviteStatus: [];
    raidStatus: [];
    raidResult: [];
    territoryBattleStatus: [];
    guildEvents: [];
    territoryBattleResult: [];
    territoryWarStatus: [];
    roomAvailable: [];
    arcadeRaidStatus: [];
    stat: [];
    recentRaidResult: [];
    recentTerritoryWarResult: [];
    profile: ProfileData;
    inventory: null;
    progress: null;
    nextChallengesRefresh: string;
  };
}
