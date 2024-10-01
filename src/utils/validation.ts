import { ChatInputCommandInteraction, InteractionType } from 'discord.js';
import { ServerWithRelations } from '../interfaces/database/server-table-interface';
import { Logger } from '../logger';

interface ChannelInformationInterface {
  strikeChannelName: string;
  strikeChannelId: string;
}

export const validateServerChannels = (server: ServerWithRelations): ChannelInformationInterface => {
  Logger.info('Validating Channels');
  const { strikeChannelId, strikeChannelName } = server.channels;

  Logger.info(`Server ID: ${server.serverId}`);
  Logger.info(`Strike Channel Name & ID: ${strikeChannelName}: ${strikeChannelId}`);

  if (!strikeChannelId || !strikeChannelName) {
    Logger.error('Strike channel not found in the database.');
    throw new Error(
      'Strike channel not found in the database. Please set up the server channels using the command /setupchannels',
    );
  }

  Logger.info(`Channels found for server: ${server.serverId}`);
  Logger.info(`Strike Channel Name & ID: ${strikeChannelName}: ${strikeChannelId}`);

  return {
    strikeChannelName,
    strikeChannelId,
  };
};

export const validateInteractionType = (interaction: ChatInputCommandInteraction): void => {
  Logger.info('Validating Interaction Type');
  if (interaction.type !== InteractionType.ApplicationCommand || !interaction.isChatInputCommand()) {
    Logger.info('Interaction is not an Application Command');
    throw new Error();
  }
  Logger.info('Interaction Valid');
  return;
};

