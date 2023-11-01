import { ApplicationCommandOptionType, InteractionType, TextChannel } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { GuildSetup } from '../../methods/bot-setup';
import { ServerTableService } from '../../database/services/server-services';

export default new Command({
  name: 'setupchannels',
  description: 'Sets the role you desire to be used as your "away" role for strikes to be forgiven',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      name: 'ticketchannel',
      description: 'Channel which is used to post ticket offenses',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: 'strikechannel',
      description: 'Channel which is used to post all strikes',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: 'strikelimitchannel',
      description: 'Channel which is for members who hit strike limit',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  execute: async ({ interaction }) => {
    try {
      Logger.info('Bot Setup command executed');

      if (!isValidInteraction(interaction)) {
        Logger.info('Interaction is not an Application Command');
        return undefined;
      }

      const serverRecord = await ServerTableService.getServerTableByServerId(interaction.guild.id);

      if (!serverRecord) {
        await ServerTableService.createServerTableEntryByInteraction(interaction);
      }

      Logger.info('Retrieving Guild Data from Interaction.');

      const [ticketChannel, strikeChannel, strikeLimitChannel] = retrieveChannelOptions(interaction);

      const serverData = { ticketChannel, strikeChannel, strikeLimitChannel };

      Logger.info('Data Successfully Retrieved');

      const setupData = await GuildSetup.setupGuildChannels(interaction, serverData);

      Logger.info('Guild data setup completed');

      return {
        message: 'Guild Channels set successfully',
        content: setupData,
      };
    } catch (error) {
      Logger.error(`An error occurred in the Bot Setup command: ${error}`);
      return {
        message: 'An error occurred while setting up guild data. Please try again later.',
        content: error,
      };
    }
  },
});

function isValidInteraction(interaction) {
  return interaction.type === InteractionType.ApplicationCommand && interaction.isChatInputCommand();
}

function retrieveChannelOptions(interaction) {
  return [
    interaction.options.getChannel('ticketchannel') as TextChannel,
    interaction.options.getChannel('strikechannel') as TextChannel,
    interaction.options.getChannel('strikelimitchannel') as TextChannel,
  ];
}
