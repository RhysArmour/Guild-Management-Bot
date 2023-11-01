import { ApplicationCommandOptionType, InteractionType } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { GuildSetup } from '../../methods/bot-setup';
import { ServerTableService } from '../../database/services/server-services';

export default new Command({
  name: 'setuplimits',
  description: 'Sets the role you desire to be used as your "away" role for strikes to be forgiven',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      name: 'ticketlimit',
      description: 'The limit of tickets a player must produce before being given a strike',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: 'strikelimit',
      description: 'The limit of strikes a player can receive before being given the strike limit role',
      type: ApplicationCommandOptionType.Integer,
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

      const serverData = extractServerData(interaction);

      Logger.info('Data Successfully Retrieved');

      const setupData = await GuildSetup.setupGuildLimits(interaction, serverData);

      Logger.info('Guild data setup completed');

      return {
        message: 'Successfully setup limits',
        content: setupData,
      };
    } catch (error) {
      Logger.error(`An error occurred in the Bot Setup command: ${error}`);
      return 'An error occurred while setting up guild data. Please try again later.';
    }
  },
});

function isValidInteraction(interaction) {
  return interaction.type === InteractionType.ApplicationCommand && interaction.isChatInputCommand();
}

function extractServerData(interaction) {
  return {
    ticketLimit: interaction.options.getInteger('ticketlimit'),
    strikeLimit: interaction.options.getInteger('strikelimit'),
  };
}
