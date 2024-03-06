import { ApplicationCommandOptionType, Role } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { GuildSetup } from '../../methods/bot-setup';
import { ServerWithRelations } from '../../interfaces/database/server-table-interface';

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
  execute: async ({ interaction }, server: ServerWithRelations) => {
    try {
      Logger.info(`Bot Setup Roles command executed for server: ${server.serverId}`);

      Logger.info('Retrieving Guild Data from Interaction.');

      const serverData = extractServerData(interaction);

      Logger.info('Data Successfully Retrieved');

      await GuildSetup.setupGuildRoles(interaction, serverData);

      Logger.info('Guild data setup completed');

      const result = {
        title: 'Setup Roles',
        fields: [{ name: 'Message', value: 'Server Roles set successfully' }],
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
    absenceRole: interaction.options.getRole('absencerole') as Role,
    guildRole: interaction.options.getRole('guildrole') as Role,
    strikeLimitRole: interaction.options.getRole('strikelimitrole') as Role,
  };
}
