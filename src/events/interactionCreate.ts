import {
  CommandInteractionOptionResolver,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ChannelSelectMenuInteraction,
  RoleSelectMenuInteraction,
} from 'discord.js';
import { client } from '../bot';
import { Event } from '../classes/Event';
import { ExtendedAutocompleteInteraction, ExtendedInteraction } from '../interfaces/discord/Command';
import { Logger } from '../logger';
import { ServerRepository } from '../database/repositories/server-repository';
import { GuildSetup } from '../methods/bot-setup';

export default new Event('interactionCreate', async (interaction) => {
  // Chat Input Commands
  if (interaction.isChatInputCommand()) {
    Logger.info('Starting Interaction');
    await interaction.deferReply({ flags: 64 as number });
    Logger.info('Reply deferred');
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      Logger.error('Interaction Failed. Non-Existing Command.');
      return interaction.followUp('You have used a non-existing command');
    }

    Logger.info('Received Command List.');
    try {
      Logger.info(`Executing command: ${command.name}`);
      Logger.info(`Checking server has been registered for server: ${interaction.guildId}`);
      const server = await new ServerRepository().findServer(interaction.guildId);

      if (command.name !== 'configure-server' && !server) {
        Logger.warn(`Server: ${interaction.guildId} has not been configured.`);
        await interaction.followUp(
          'Server has not been set up. Please set up the server using the command: \n- `/configure-server`',
        );
        return;
      }

      // Execute the command and handle the result
      const result = await command.execute(
        {
          args: interaction.options as CommandInteractionOptionResolver,
          client,
          interaction: interaction as ExtendedInteraction,
        },
        server,
      );

      // Handle void responses
      if (!result) {
        Logger.info('Command executed successfully with no response.');
        return;
      }

      // Handle array of embeds
      if (Array.isArray(result)) {
        Logger.info(`Command returned an array of ${result.length} embeds.`);
        await interaction.editReply({ embeds: [result[0]] });

        for (let i = 1; i < result.length; i++) {
          await interaction.followUp({ embeds: [result[i]] });
        }
        return;
      }

      // Handle single embed response
      Logger.info('Command executed successfully with a single embed.');
      await interaction.followUp({ embeds: [result] });
    } catch (error) {
      Logger.error(`Error while executing ${command.name}: ${error}`);
      // Error during execution
      await interaction.followUp('An error occurred while executing the command.');
    }
  }
  // Button Interactions
  else if (interaction.isButton() && interaction.customId !== 'confirm-expire') {
    Logger.info('Button interaction detected.');
    await interaction.deferUpdate();
    try {
      const serverId = interaction.guildId;

      // Fetch the server data from the database
      const server = await new ServerRepository().findServer(serverId);
      if (!server) {
        await interaction.reply({
          content: 'Server configuration not found. Please run the setup-server command first.',
          ephemeral: true,
        });
        return;
      }

      if (interaction.customId === 'strike-reason') {
        return;
      }

      // Handle button interactions based on customId
      switch (interaction.customId) {
        case 'configure-server':
          await GuildSetup.handleServerButton(interaction as ButtonInteraction);
          break;

        case 'configure-channels':
          await GuildSetup.handleChannelsButton(interaction as ButtonInteraction);
          break;

        case 'configure-roles':
          await GuildSetup.handleRolesButton(interaction as ButtonInteraction);
          break;

        case 'auto-ticket-strikes-on':
          await GuildSetup.handleServerButton(interaction as ButtonInteraction);
          break;

        case 'auto-ticket-strikes-off':
          await GuildSetup.handleServerButton(interaction as ButtonInteraction);
          break;

        case 'refresh-data':
          await GuildSetup.handleRefreshButton(interaction as ButtonInteraction);
          break;

        default:
          await interaction.editReply({
            content: 'Unknown button interaction.',
            flags: 64 as number, // Ephemeral flag,
          });
      }
    } catch (error) {
      Logger.error(`Error handling button interaction: ${error}`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'An error occurred while processing your request.',
          ephemeral: true,
        });
      } else {
        await interaction.editReply({
          content: 'An error occurred while processing your request.',
          flags: 64 as number, // Ephemeral flag,
        });
      }
    }
  }
  // Menu Interactions
  else if (interaction.isStringSelectMenu()) {
    // Now handle all select menus here
    // But you must check for both strike-reason and select-strike and return early if needed
    if (interaction.customId.startsWith('strike-reason') || interaction.customId.startsWith('select-strike')) {
      // Let the collector handle it, do nothing here
      return;
    }
    Logger.info(`Select menu interaction detected: ${interaction.customId}`);
    await interaction.deferUpdate();
    try {
      const serverId = interaction.guildId;

      // Fetch the server data from the database
      const server = await new ServerRepository().findServer(serverId);
      if (!server) {
        await interaction.reply({
          content: 'Server configuration not found. Please run the setup-server command first.',
          ephemeral: true,
        });
        return;
      }

      if (interaction.customId.startsWith('strike-reason')) {
        return;
      }

      // Handle select menu interactions based on customId
      switch (interaction.customId) {
        case 'strike-reset-period':
        case 'strike-limit':
        case 'ticket-limit':
          await GuildSetup.handleServerButton(interaction as StringSelectMenuInteraction);
          break;

        default:
          Logger.warn(`Unknown select menu interaction: ${interaction.customId}`);
          await interaction.editReply({
            content: 'Unknown select menu interaction.',
            flags: 64 as number, // Ephemeral flag,
          });
      }
    } catch (error) {
      Logger.error(`Error handling select menu interaction: ${error}`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'An error occurred while processing your request.',
          ephemeral: true,
        });
      } else {
        await interaction.editReply({
          content: 'An error occurred while processing your request.',
          flags: 64 as number, // Ephemeral flag
        });
      }
    }
  }
  // Channel Select Menu Interactions
  else if (interaction.isChannelSelectMenu()) {
    Logger.info(`Channel select menu interaction detected: ${interaction.customId}`);
    await interaction.deferUpdate();
    try {
      const serverId = interaction.guildId;

      // Fetch the server data from the database
      const server = await new ServerRepository().findServer(serverId);
      if (!server) {
        await interaction.reply({
          content: 'Server configuration not found. Please run the setup-server command first.',
          ephemeral: true,
        });
        return;
      }

      // Handle channel select menu interactions based on customId
      switch (interaction.customId) {
        case 'strike-channel':
        case 'strike-limit-channel':
        case 'notification-channel':
          await GuildSetup.handleChannelsButton(interaction as ChannelSelectMenuInteraction);
          break;

        default:
          Logger.warn(`Unknown channel select menu interaction: ${interaction.customId}`);
          await interaction.editReply({
            content: 'Unknown channel select menu interaction.',
            flags: 64 as number, // Ephemeral flag,
          });
      }
    } catch (error) {
      Logger.error(`Error handling channel select menu interaction: ${error}`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'An error occurred while processing your request.',
          ephemeral: true,
        });
      } else {
        await interaction.editReply({
          content: 'An error occurred while processing your request.',
          flags: 64 as number, // Ephemeral flag,
        });
      }
    }
  }
  // Role Select Menu Interactions
  else if (interaction.isRoleSelectMenu()) {
    Logger.info(`Role select menu interaction detected: ${interaction.customId}`);
    await interaction.deferUpdate();
    try {
      const serverId = interaction.guildId;

      // Fetch the server data from the database
      const server = await new ServerRepository().findServer(serverId);
      if (!server) {
        await interaction.editReply({
          content: 'Server configuration not found. Please run the setup-server command first.',
          flags: 64 as number, // Ephemeral flag,
        });
        return;
      }

      // Handle role select menu interactions based on customId
      switch (interaction.customId) {
        case 'guild-role':
        case 'absence-role':
        case 'strike-limit-role':
          await GuildSetup.handleRolesButton(interaction as RoleSelectMenuInteraction);
          break;

        default:
          Logger.warn(`Unknown role select menu interaction: ${interaction.customId}`);
          await interaction.editReply({
            content: 'Unknown role select menu interaction.',
            flags: 64 as number, // Ephemeral flag,
          });
      }
    } catch (error) {
      Logger.error(`Error handling role select menu interaction: ${error}`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'An error occurred while processing your request.',
          ephemeral: true,
        });
      } else {
        await interaction.editReply({
          content: 'An error occurred while processing your request.',
          flags: 64 as number, // Ephemeral flag,
        });
      }
    }
  }

  // Autocomplete Interactions
  else if (interaction.isAutocomplete()) {
    Logger.info('Starting Auto Complete Interaction');
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.autocomplete({
        args: interaction.options as CommandInteractionOptionResolver,
        client,
        interaction: interaction as ExtendedAutocompleteInteraction,
      });
    } catch (error) {
      Logger.error(`Error while executing ${command.name}: ${error}`);
    }
  }
});
