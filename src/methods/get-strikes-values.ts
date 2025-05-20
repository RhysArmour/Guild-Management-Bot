import { ChatInputCommandInteraction } from 'discord.js';
import { Logger } from '../logger';
import { autocompleteChoices } from '../utils/helpers/commandVariables';
import { Server } from '../../db';

export const getStrikeValues = async (interaction: ChatInputCommandInteraction, server: Server) => {
  try {
    // const { strikeLimit } = server.limits;
    const { strikes } = server;
    const chosenStrike = interaction.options.getString('strike');
    let message = '';
    if (!strikes.length) {
      Logger.info(`No Guild Strike Values assigned. Sending default response.`);
      for (const choice of autocompleteChoices) {
        message += `${choice}: 1\n`;
      }
    } else if (!chosenStrike) {
      Logger.info('No strike chosen, returning all strike values');
      for (const choice of autocompleteChoices) {
        const strike = strikes.find((entry) => entry.reason === choice);
        if (!strike) {
          message += `${choice}: 1\n`;
        } else {
          message += `${strike.reason}: ${strike.active}\n`;
        }
      }
    } else {
      const strikeValueRecord = strikes.find((strike) => strike.reason === chosenStrike);
      Logger.info(`Strike Value ${strikeValueRecord.reason} chosen, returning result`);
      message += `${strikeValueRecord.reason}: ${strikeValueRecord.active}`;
    }

    return message;
  } catch (error) {
    Logger.info(error);
  }
};
