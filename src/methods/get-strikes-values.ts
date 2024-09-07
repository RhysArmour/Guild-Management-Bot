import { ChatInputCommandInteraction } from 'discord.js';
import { ServerWithRelations } from '../interfaces/database/server-table-interface';
import { Logger } from '../logger';
import { autocompleteChoices } from '../utils/helpers/commandVariables';

export const getStrikeValues = async (interaction: ChatInputCommandInteraction, server: ServerWithRelations) => {
  try {
    // const { strikeLimit } = server.limits;
    const { guildStrikes } = server;
    const chosenStrike = interaction.options.getString('strike');
    let message = '';
    if (!guildStrikes.length) {
      Logger.info(`No Guild Strike Values assigned. Sending default response.`);
      for (const choice of autocompleteChoices) {
        message += `${choice}: 1\n`;
      }
    } else if (!chosenStrike) {
      Logger.info('No strike chosen, returning all strike values');
      for (const choice of autocompleteChoices) {
        const strike = guildStrikes.find((entry) => entry.strikeReason === choice);
        if (!strike) {
          message += `${choice}: 1\n`;
        } else {
          message += `${strike.strikeReason}: ${strike.value}\n`;
        }
      }
    } else {
      const strikeValueRecord = guildStrikes.find((strike) => strike.strikeReason === chosenStrike);
      Logger.info(`Strike Value ${strikeValueRecord.strikeReason} chosen, returning result`);
      message += `${strikeValueRecord.strikeReason}: ${strikeValueRecord.value}`;
    }

    return message;
  } catch (error) {
    Logger.info(error);
  }
};

