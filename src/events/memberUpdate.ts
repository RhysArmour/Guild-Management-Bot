import { GuildMember } from 'discord.js';
import { Event } from '../classes/Event';
import { Logger } from '../logger';
import { sortRole } from '../methods/sort-roles';
import { ServerRepository } from '../database/repositories/server-repository';

export default new Event('guildMemberUpdate', async (oldMember: GuildMember, newMember: GuildMember) => {
  try {
    Logger.info(`Executing update for: ${oldMember.displayName}`);
    const server = await new ServerRepository().findServer(oldMember.guild.id);
    await sortRole(oldMember, newMember, server);
    return;
  } catch (error) {
    Logger.error(`Error while updating member ${oldMember.displayName}: ${error}`);
    throw error;
  }
});
