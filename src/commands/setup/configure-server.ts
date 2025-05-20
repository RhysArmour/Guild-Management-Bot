import {
  ChatInputCommandInteraction,
  APIActionRowComponent,
  APIMessageActionRowComponent,
  ApplicationCommandOptionType,
  PermissionsBitField,
} from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { GuildSetup } from '../../methods/bot-setup';
import { ServerRepository } from '../../database/repositories/server-repository';
import { Comlink } from '../../classes/Comlink';

export default new Command({
  name: 'configure-server',
  description: 'Setup the server configuration',
  defaultMemberPermissions: PermissionsBitField.Flags.KickMembers,
  options: [
    {
      name: 'ally-code',
      description: 'The ally code of the guild leader (Only required if the server is not already set up)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  execute: async ({ interaction }: { interaction: ChatInputCommandInteraction }) => {
    try {
      const allyCode = interaction.options.getString('ally-code', false) || null;
      const serverId = interaction.guildId;

      Logger.info(`Setting up server for guild with ally code: ${allyCode}`);

      // Check if the server exists
      let server = await new ServerRepository().findServer(serverId);

      if (!server) {
        Logger.info('No existing server configuration found. Creating a new server entry.');

        if (!allyCode) {
          await interaction.editReply({
            content: 'Please provide the guild leaders ally code to set up the server.',
            flags: 64 as number, // Ephemeral flag
          });
          return;
        }

        const playerData = await Comlink.getPlayerByAllyCode(allyCode);
        const guildData = await Comlink.getGuildDataByGuildId(playerData.guildId);

        // Create a new server entry with default values
        server = await new ServerRepository().createServer(
          serverId,
          {
            serverId,
            serverName: interaction.guild.name,
          },
          guildData,
        );
      }

      // Generate the initial embed
      const { embed, components } = await GuildSetup.generateMainEmbed(server);

      await interaction.editReply({
        content: 'Please configure the server settings using the buttons below:',
        embeds: [embed],
        components: components as unknown as APIActionRowComponent<APIMessageActionRowComponent>[],
        flags: 64 as number, // Ephemeral flag
      });
    } catch (error) {
      Logger.error(`Error in setup-server command: ${error}`);
      await interaction.editReply({
        content: 'An error occurred while setting up the server. Please try again later.',
        flags: 64 as number, // Ephemeral flag
      });
    }
  },
});
