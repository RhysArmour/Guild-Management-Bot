import { SlashCommandBuilder } from '@discordjs/builders';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import prisma from '../../utils/database/prisma';

export default new Command({
  name: 'checkallstrikes',
  description: 'Check strikes for all members',
  execute: async ({ interaction }) => {
    const serverId = interaction.guildId;
    const result = await prisma.members.findMany({
      where: { serverId: serverId },
      select: {
        name: true,
        strikes: true,
        lifetimeStrikes: true
      },
    });

    Logger.info(`Received strike list: ${result}`)

    let message = ''

    Logger.info(result)

    result.forEach((item) => {
      Logger.info(item)
      message = message + `Name: ${item.name} - Strikes: ${item.strikes} - Lifetime Strikes: ${item.lifetimeStrikes}\n`
    })

    return message;
  },
});
