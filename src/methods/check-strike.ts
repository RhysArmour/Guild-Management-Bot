import { CommandInteraction, TextChannel } from 'discord.js';
import prisma from '../utils/database/prisma';
import { Logger } from '../logger';
import { Members, Strikes } from '@prisma/client';
import { assignStrikes, getStrikes } from '../utils/database/services/member-services';
import { filterCurrentMonthReasons, getReasons } from '../utils/database/services/strike-reason-services';
import { currentDate } from '../utils/helpers/get-date';

export const checkStrikes = async (interaction: CommandInteraction) => {
  try {
    Logger.info('Beggining check Strikes');
    const {month} = currentDate()
    const serverId = interaction.guildId!;
    const { strikeChannelId, strikeChannelName } = await prisma.strikes.findUnique({
      where: { serverId: serverId },
    });
    Logger.info('Database entry found');
    const strike = ':x:';
    let message = '';
    const length = interaction.options.data.length;

    Logger.info(`Server ID: ${serverId}`);
    Logger.info(`Strike Channel Name & ID: ${strikeChannelName}: ${strikeChannelId}`);

    for (let i = 0; i < length; i += 1) {
      const user = interaction.options.getUser(`user${i + 1}`)!;
      Logger.info(user)
      const { id, username } = user;
      const tag = `<@${id}>`;

      Logger.info(`Processing info for User ID: ${id}, Username: ${username}`);

      const {strikes, lifetimeStrikes} = await getStrikes(user, serverId);
      const filteredReasons = await filterCurrentMonthReasons(user, serverId) 
      Logger.info(strikes);
      message += `${username} has ${strikes} strikes ${strike.repeat(
        strikes,
      )} and ${lifetimeStrikes} Lifetime Strikes\n${username} strikes for ${month}:\n${filteredReasons}\n\n\n`;
    }

    Logger.info(`getStrikes Message: ${message}`);

    return message;
  } catch (error) {
    Logger.error(error);
    await interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true,
    });
  }
};
