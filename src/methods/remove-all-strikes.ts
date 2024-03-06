import { CommandInteraction } from 'discord.js';
import { Logger } from '../logger';
import { ServerWithRelations } from '../interfaces/database/server-table-interface';
import { MemberTableServices } from '../database/services/member-services';
import prisma from '../classes/PrismaClient';

export const removeAllStrikes = async (interaction: CommandInteraction, server: ServerWithRelations) => {
  try {
    Logger.info('Removing All Strikes');
    try {
      let guildId: string;
      if (interaction instanceof CommandInteraction) {
        guildId = interaction.guildId as string;
      } else {
        guildId = interaction;
      }

      const guildMembers = await MemberTableServices.getAllMembersDataByServerId(server.serverId);

      for (const member of guildMembers) {
        if (member.strikes > 0) {
          Logger.info(`Strikes found for Member: ${member.name}`);
          let totalStrikesToRemove = 0;

          Logger.info('Looping through strike reasons');
          for (const strike of member.strikeReasons) {
            const strikeValue = await prisma.guildStrikeValues.findFirst({
              where: { serverId: guildId, strikeReason: strike.reason },
            });
            if (!strikeValue) {
              Logger.info('No strike value assigned. Setting to 1 strike');
              totalStrikesToRemove += 1;
            } else {
              totalStrikesToRemove += strikeValue.value;
            }
            await prisma.memberStrikeReasons.delete({
              where: { unique_reason: { uniqueId: strike.uniqueId, date: strike.date, reason: strike.reason } },
            });
          }

          Logger.info(`Removing ${totalStrikesToRemove} strikes`);

          await MemberTableServices.removeAllStrikesUpdate(member, totalStrikesToRemove);
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
