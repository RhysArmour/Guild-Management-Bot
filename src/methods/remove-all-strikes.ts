import { CommandInteraction } from 'discord.js';
import { Logger } from '../logger';
import prisma from '../utils/database/prisma';

export const removeAllStrikes = async (interaction: CommandInteraction) => {
  const serverId = interaction.guild.id;

  try {
    Logger.info('Removing All Strikes');
    await prisma.members.updateMany({
      where: { serverId: serverId },
      data: {
        strikes: 0,
      },
    }),
    Logger.info('All Strikes removed successfully');

    return 'All member strikes removed';
  } catch (error) {
    Logger.error(error);
  }
};
