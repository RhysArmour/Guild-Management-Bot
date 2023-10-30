import { GuildMember } from 'discord.js';
import { Event } from '../classes/Event';
import { Logger } from '../logger';
import { sortRole } from '../methods/sort-roles';

export default new Event('guildMemberUpdate', async (oldMember: GuildMember, newMember: GuildMember) => {
  try {
    Logger.info(`Executing update for: ${oldMember.displayName}`);
    await sortRole(oldMember, newMember);
    return;
  } catch (error) {
    Logger.error(`Error while updating member ${oldMember.displayName}: ${error}`);
    throw error;
  }
});
