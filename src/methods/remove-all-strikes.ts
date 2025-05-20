import { CommandInteraction } from 'discord.js';
import { Logger } from '../logger';
import prisma from '../classes/PrismaClient';
import { MemberRepository } from '../database/repositories/member-repository';
import { StrikeRepository } from '../database/repositories/strikes-repository';
import { Server } from '../../db';

export const removeAllStrikes = async (interaction: CommandInteraction, server: Server) => {
  try {
    Logger.info('Removing All Strikes');
    try {
      let guildId: string;
      if (interaction instanceof CommandInteraction) {
        guildId = interaction.guildId as string;
      } else {
        guildId = interaction;
      }

      const guildMembers = await new MemberRepository().findAllServerMembers(server.serverId);

      for (const member of guildMembers) {
        if (member.strikes.length > 0) {
          Logger.info(`Strikes found for Member: ${member.displayName}`);
          let totalStrikesToRemove = 0;

          Logger.info('Looping through strike reasons');
          for (const strike of member.strikes) {
            const strikeValue = await prisma.guildStrikeValues.findFirst({
              where: { serverId: guildId, strikeReason: strike.reason },
            });
            if (!strikeValue) {
              Logger.info('No strike value assigned. Setting to 1 strike');
              totalStrikesToRemove += 1;
            } else {
              totalStrikesToRemove += strikeValue.value;
            }
            await new StrikeRepository().delete({
              id: strike.id,
              assignedDate: strike.assignedDate,
              reason: strike.reason,
            });
          }

          Logger.info(`Removing ${totalStrikesToRemove} strikes`);

          // await new MemberRepository().delete(member, totalStrikesToRemove);
        }
      }

      return 'All strikes successfully removed';
    } catch (error) {
      Logger.error(error);
    }

    return 'All member strikes removed';
  } catch (error) {
    Logger.error(`Error in removeAllStrikes: ${error}`);
    await interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true,
    });
  }
};
