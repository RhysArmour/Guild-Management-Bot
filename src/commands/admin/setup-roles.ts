import { ApplicationCommandOptionType, InteractionType, Role } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { GuildSetup } from '../../methods/bot-setup';
import { ServerTableService } from '../../database/services/server-services';

export default new Command({
  name: 'setuproles',
  description: 'Sets the role you desire to be used as your "away" role for strikes to be forgiven',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      name: 'guildrole',
      description: "Role which is used to show the guild's role",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: 'absencerole',
      description: 'Role which is used to show a player will be absent',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: 'strikelimitrole',
      description: 'Role which is given when a member hits the guild strike limit',
      type: ApplicationCommandOptionType.Role,
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

      const setupData = await GuildSetup.setupGuildRoles(interaction, serverData);

      Logger.info('Guild data setup completed');

      return {
        content: setupData,
        message: 'Role setup complete.',
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
    absenceRole: interaction.options.getRole('absencerole') as Role,
    guildRole: interaction.options.getRole('guildrole') as Role,
    strikeLimitRole: interaction.options.getRole('strikelimitrole') as Role,
  };
}
