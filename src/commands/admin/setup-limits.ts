import { ApplicationCommandOptionType } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { GuildSetup } from '../../methods/bot-setup';
import { ServerWithRelations } from '../../interfaces/database/server-table-interface';

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
  execute: async ({ interaction }, server: ServerWithRelations) => {
    try {
      Logger.info(`Bot Setup Limits command executed for server: ${server.serverId}`);

      const serverData = extractServerData(interaction);

      Logger.info('Data Successfully Retrieved');

      await GuildSetup.setupGuildLimits(interaction, serverData);

      Logger.info('Guild data setup completed');

      const result = {
        title: 'Setup Limits',
        fields: [{ name: 'Message', value: 'Server Limits set successfully' }],
      };

      return result;
    } catch (error) {
      Logger.error(`An error occurred in the Bot Setup command: ${error}`);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occured whilst setting up the bot. Please try again later.' }],
      };
    }
  },
});

function extractServerData(interaction) {
  return {
    ticketLimit: interaction.options.getInteger('ticketlimit'),
    strikeLimit: interaction.options.getInteger('strikelimit'),
  };
}
