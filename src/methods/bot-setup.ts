import { Logger } from '../logger';
import { ChannelRepository } from '../database/repositories/channels-repository';
import { ServerRepository } from '../database/repositories/server-repository';
import { RoleRepository } from '../database/repositories/roles-repository';
import { Channels, Roles, Server } from '../../db/models';
import { CreationAttributes } from 'sequelize';
import {
  ActionRowBuilder,
  APIEmbed,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuInteraction,
  ChannelType,
  PermissionsBitField,
  RoleSelectMenuBuilder,
  RoleSelectMenuInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { Comlink } from '../classes/Comlink';

const channelRepo = new ChannelRepository();
const roleRepo = new RoleRepository();

export class GuildSetup {
  private static logAndThrowError(message: string, error: Error): void {
    Logger.error(message, error);
    throw new Error(message);
  }

  private static async checkAdminPermissions(interaction: ButtonInteraction): Promise<boolean> {
    const member = interaction.member;

    if (!member || !('permissions' in member)) {
      await interaction.reply({
        content: 'Unable to verify your permissions.',
        ephemeral: true,
      });
      return false;
    }

    if (
      !(member.permissions instanceof PermissionsBitField) ||
      !member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      await interaction.reply({
        content: 'You do not have the required permissions to interact with this button.',
        ephemeral: true,
      });
      return false;
    }

    return true;
  }

  static async generateMainEmbed(server: Server): Promise<{ embed: APIEmbed; components: ActionRowBuilder[] }> {
    const { channels, roles, guild } = server;

    const allFieldsFilled =
      server.strikeResetPeriod &&
      server.strikeLimit &&
      server.ticketLimit &&
      server.ticketStrikesActive &&
      channels?.strikeChannelId &&
      channels?.strikeLimitChannelId &&
      channels?.notificationChannelId &&
      roles?.guildRoleId &&
      roles?.absenceRoleId &&
      roles?.strikeLimitRoleId;

    const liveGuildInfo = await Comlink.getGuildDataByGuildId(server.guild.guildId);

    const embed: APIEmbed = {
      title: '⚙️ **Server Configuration**',
      description: allFieldsFilled
        ? '✅ **All fields are configured.**'
        : '⚠️ **Some fields are missing. Please configure the missing fields below.**',
      fields: [
        {
          name: '🛠️ **Server Info**',
          value: `**Server Name:** ${server.serverName}\n**Strike Reset Period:** ${
            server.strikeResetPeriod || '❌ Not Set'
          }\n**Strike Limit:** ${server.strikeLimit || '❌ Not Set'}\n**Ticket Limit:** ${
            server.ticketLimit || '❌ Not Set'
          }\n**Ticket Strikes Active:** ${server.ticketStrikesActive ? '✅ Enabled' : '❌ Disabled'}`,
        },
        {
          name: '📢 **Channel Info**',
          value: `**Strike Room:** ${
            channels?.strikeChannelId ? `<#${channels.strikeChannelId}>` : '❌ Not Set'
          }\n**Strike Limit Room:** ${
            channels?.strikeLimitChannelId ? `<#${channels.strikeLimitChannelId}>` : '❌ Not Set'
          }\n**Notification Room:** ${
            channels?.notificationChannelId ? `<#${channels.notificationChannelId}>` : '❌ Not Set'
          }`,
        },
        {
          name: '👥 **Role Info**',
          value: `**Guild Role:** ${
            roles?.guildRoleId ? `<@&${roles.guildRoleId}>` : '❌ Not Set'
          }\n**Absence Role:** ${
            roles?.absenceRoleId ? `<@&${roles.absenceRoleId}>` : '❌ Not Set'
          }\n**Strike Limit Role:** ${roles?.strikeLimitRoleId ? `<@&${roles.strikeLimitRoleId}>` : '❌ Not Set'}`,
        },
        {
          name: '🏰 **Guild Info**',
          value: `**Guild Name:** ${guild?.guildName || '❌ Not Set'}\n**Galactic Power:** ${
            guild?.galacticPower || '❌ Not Set'
          }\n**Guild Reset Time (UTC):** ${
            guild?.guildResetTime
              ? guild.guildResetTime.toISOString().slice(11, 19) // Extract HH:mm:ss in UTC
              : '❌ Not Set'
          }\n**Members**: ${liveGuildInfo.guild.member.length}\n**Average GP:** ${(
            parseInt(liveGuildInfo.guild.profile.guildGalacticPower) / liveGuildInfo.guild.member.length
          ).toLocaleString('en-US', {
            maximumFractionDigits: 0,
          })}`,
        },
      ],
      color: allFieldsFilled ? 0x00ff00 : 0xffcc00, // Green if complete, yellow if incomplete
      footer: {
        text: 'Use the buttons below to configure your server settings.',
      },
      timestamp: new Date().toISOString(),
    };

    const components = [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('configure-server').setLabel('⚙️ Server').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('configure-channels').setLabel('📢 Channels').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('configure-roles').setLabel('👥 Roles').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('refresh-data').setLabel('🔴 Refresh').setStyle(ButtonStyle.Primary),
      ),
    ];

    return { embed, components };
  }
  static async handleRefreshButton(interaction: ButtonInteraction) {
    if (!(await GuildSetup.checkAdminPermissions(interaction as ButtonInteraction))) {
      return;
    }
    try {
      const serverId = interaction.guildId;

      if (!serverId) {
        throw new Error('Server ID is missing from the interaction.');
      }

      Logger.info('Refreshing server data...');

      // Fetch the latest server data from the database
      const updatedServer = await new ServerRepository().findServer(serverId);

      if (!updatedServer) {
        await interaction.reply({
          content: 'Server configuration not found. Please run the setup-server command first.',
          ephemeral: true,
        });
        return;
      }

      // Generate the updated embed and components
      const { embed, components } = await GuildSetup.generateMainEmbed(updatedServer);

      // Send the updated embed as a reply
      await interaction.editReply({
        content: 'Server data refreshed successfully.',
        embeds: [embed],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        components: components as any,
      });

      Logger.info('Server data refreshed and updated embed sent.');
    } catch (error) {
      Logger.error(`Error handling refresh button interaction: ${error}`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'An error occurred while refreshing the server data.',
          ephemeral: true,
        });
      } else {
        await interaction.editReply({
          content: 'An error occurred while refreshing the server data.',
          flags: 64 as number, // Ephemeral flag,
        });
      }
    }
  }

  static async handleServerButton(interaction: ButtonInteraction | StringSelectMenuInteraction) {
    if (interaction.isButton() && !(await GuildSetup.checkAdminPermissions(interaction as ButtonInteraction))) {
      return;
    }

    const customId = interaction.customId;

    Logger.info(`Handling server button interaction: ${customId}`);

    if (interaction.isStringSelectMenu()) {
      if (customId === 'strike-reset-period' || customId === 'strike-limit' || customId === 'ticket-limit') {
        Logger.info(`Handling select menu interaction: ${customId}`);
        const selectedValue = interaction.values[0];
        const updateField =
          customId === 'strike-reset-period'
            ? 'strikeResetPeriod'
            : customId === 'strike-limit'
            ? 'strikeLimit'
            : 'ticketLimit';
        await Server.update({ [updateField]: selectedValue }, { where: { serverId: interaction.guildId } });
      }
    }
    if (interaction.isButton()) {
      if (customId === 'auto-ticket-strikes-on') {
        Logger.info('Enabling auto ticket strikes');
        await Server.update({ ticketStrikesActive: true }, { where: { serverId: interaction.guildId } });
      } else if (customId === 'auto-ticket-strikes-off') {
        Logger.info('Disabling auto ticket strikes');
        await Server.update({ ticketStrikesActive: false }, { where: { serverId: interaction.guildId } });
      }
    }

    const updatedServer = await new ServerRepository().findById(interaction.guildId);

    const embed: APIEmbed = {
      title: 'Configure Server Settings',
      fields: [
        {
          name: 'Strike Reset Period',
          value: updatedServer.strikeResetPeriod || 'Not Set',
        },
        {
          name: 'Strike Limit',
          value: updatedServer.strikeLimit?.toString() || 'Not Set',
        },
        {
          name: 'Ticket Limit',
          value: updatedServer.ticketLimit?.toString() || 'Not Set',
        },
        {
          name: 'Auto Ticket Strikes',
          value: updatedServer.ticketStrikesActive ? 'On' : 'Off',
        },
      ],
      color: 0x00ff00,
    };

    const components = [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('strike-reset-period')
          .setPlaceholder('Select Strike Reset Period')
          .addOptions([
            { label: '1 week', value: 'P1W' },
            { label: '2 weeks', value: 'P2W' },
            { label: '3 weeks', value: 'P3W' },
            { label: '4 weeks', value: 'P4W' },
            { label: '1 month', value: 'P1M' },
            { label: '2 months', value: 'P2M' },
            { label: '3 months', value: 'P3M' },
            { label: '4 months', value: 'P4M' },
            { label: '5 months', value: 'P5M' },
            { label: '6 months', value: 'P6M' },
          ]),
      ),
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('strike-limit')
          .setPlaceholder('Select Strike Limit')
          .addOptions(
            Array.from({ length: 10 }, (_, i) => ({
              label: `${i + 1}`,
              value: `${i + 1}`,
            })),
          ),
      ),
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('ticket-limit')
          .setPlaceholder('Select Ticket Limit')
          .addOptions(
            Array.from({ length: 12 }, (_, i) => ({
              label: `${(i + 1) * 50}`,
              value: `${(i + 1) * 50}`,
            })),
          ),
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('auto-ticket-strikes-on')
          .setLabel('Enable Auto Ticket Strikes')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('auto-ticket-strikes-off')
          .setLabel('Disable Auto Ticket Strikes')
          .setStyle(ButtonStyle.Danger),
      ),
    ];

    if (customId === 'configure-server') {
      interaction.followUp({
        embeds: [embed],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        components: components as any,
        flags: 64 as number, // Use the appropriate numeric value
      });
    } else {
      await interaction.editReply({
        embeds: [embed],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        components: components as any,
        flags: 64 as number, // Use the appropriate numeric value
      });
    }
  }

  static async handleChannelsButton(interaction: ButtonInteraction | ChannelSelectMenuInteraction) {
    if (!(await GuildSetup.checkAdminPermissions(interaction as ButtonInteraction))) {
      return;
    }
    const customId = interaction.customId;

    Logger.info(`Handling channels button interaction: ${customId}`);

    // Check if the interaction is a select menu interaction
    Logger.info(interaction.isChannelSelectMenu() ? 'Yes' : 'No');

    try {
      if (interaction.isChannelSelectMenu()) {
        const selectedChannelId = interaction.values[0]; // Get the selected channel ID
        const guild = interaction.guild; // Get the guild object

        if (!guild) {
          throw new Error('Guild not found in interaction.');
        }

        // Retrieve the channel object using the selected channel ID
        const selectedChannel = guild.channels.cache.get(selectedChannelId);

        if (!selectedChannel) {
          throw new Error(`Channel with ID ${selectedChannelId} not found.`);
        }

        const selectedChannelName = selectedChannel.name; // Get the channel name

        Logger.info(`Selected channel: ${selectedChannelName} (ID: ${selectedChannelId})`);

        if (
          customId === 'strike-channel' ||
          customId === 'strike-limit-channel' ||
          customId === 'notification-channel'
        ) {
          const updateFieldId =
            customId === 'strike-channel'
              ? 'strikeChannelId'
              : customId === 'strike-limit-channel'
              ? 'strikeLimitChannelId'
              : customId === 'notification-channel'
              ? 'notificationChannelId'
              : undefined;

          const updateFieldName =
            customId === 'strike-channel'
              ? 'strikeChannelName'
              : customId === 'strike-limit-channel'
              ? 'strikeLimitChannelName'
              : customId === 'notification-channel'
              ? 'notificationChannelName'
              : undefined;
          // Update the database with both the channel ID and name
          await Channels.update(
            { [updateFieldId]: selectedChannelId, [updateFieldName]: selectedChannelName },
            { where: { serverId: interaction.guildId } },
          );

          Logger.info(`Updated ${updateFieldId} and ${updateFieldName} in the database.`);
        }
      }
    } catch (error) {
      Logger.error(`Error handling channels button interaction: ${error}`);
      await interaction.followUp({
        content: 'An error occurred while updating the channel settings.',
        ephemeral: true,
      });
    }

    const updatedServer = await new ServerRepository().findServer(interaction.guildId);

    const embed: APIEmbed = {
      title: 'Configure Channels',
      fields: [
        {
          name: 'Strike Channel',
          value: updatedServer.channels?.strikeLimitChannelId
            ? `<#${updatedServer.channels.strikeChannelId}>`
            : 'Not Set',
        },
        {
          name: 'Strike Limit Channel',
          value: updatedServer.channels?.strikeLimitChannelId
            ? `<#${updatedServer.channels.strikeLimitChannelId}>`
            : 'Not Set',
        },
        {
          name: 'Notification Channel',
          value: updatedServer.channels?.notificationChannelId
            ? `<#${updatedServer.channels.notificationChannelId}>`
            : 'Not Set',
        },
      ],
      color: 0x00ff00,
    };

    const components = [
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
        new ChannelSelectMenuBuilder()
          .setCustomId('strike-channel')
          .setPlaceholder('Select Strike Channel')
          .setChannelTypes([ChannelType.GuildText]),
      ),
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
        new ChannelSelectMenuBuilder()
          .setCustomId('strike-limit-channel')
          .setPlaceholder('Select Strike Limit Channel')
          .setChannelTypes([ChannelType.GuildText]),
      ),
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
        new ChannelSelectMenuBuilder()
          .setCustomId('notification-channel')
          .setPlaceholder('Select Notification Channel')
          .setChannelTypes([ChannelType.GuildText]),
      ),
    ];

    if (customId === 'configure-channels') {
      interaction.followUp({
        embeds: [embed],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        components: components as any,
        flags: 64 as number, // Use the appropriate numeric value
      });
    }
    // If not the initial button, update the interaction
    else {
      await interaction.editReply({
        embeds: [embed],
        components,
        flags: 64 as number,
      });
    }
  }

  static async handleRolesButton(interaction: ButtonInteraction | RoleSelectMenuInteraction) {
    if (!(await GuildSetup.checkAdminPermissions(interaction as ButtonInteraction))) {
      return;
    }
    const customId = interaction.customId;

    try {
      if (interaction.isRoleSelectMenu()) {
        Logger.info(`Handling select menu interaction: ${customId}`);
        const selectedRoleId = interaction.values[0]; // Get the selected role ID
        const guild = interaction.guild; // Get the guild object

        if (!guild) {
          throw new Error('Guild not found in interaction.');
        }

        // Retrieve the role object using the selected role ID
        const selectedRole = guild.roles.cache.get(selectedRoleId);

        if (!selectedRole) {
          throw new Error(`Role with ID ${selectedRoleId} not found.`);
        }

        const selectedRoleName = selectedRole.name; // Get the role name

        Logger.info(`Selected role: ${selectedRoleName} (ID: ${selectedRoleId})`);

        if (customId === 'guild-role' || customId === 'absence-role' || customId === 'strike-limit-role') {
          const updateFieldId =
            customId === 'guild-role'
              ? 'guildRoleId'
              : customId === 'absence-role'
              ? 'absenceRoleId'
              : 'strikeLimitRoleId';

          const updateFieldName =
            customId === 'guild-role'
              ? 'guildRoleName'
              : customId === 'absence-role'
              ? 'absenceRoleName'
              : 'strikeLimitRoleName';

          // Update the database with both the role ID and name
          await Roles.update(
            { [updateFieldId]: selectedRoleId, [updateFieldName]: selectedRoleName },
            { where: { serverId: interaction.guildId } },
          );

          Logger.info(`Updated ${updateFieldId} and ${updateFieldName} in the database.`);
        }
      }
    } catch (error) {
      Logger.error(`Error handling roles button interaction: ${error}`);
      await interaction.followUp({
        content: 'An error occurred while updating the role settings.',
        ephemeral: true,
      });
    }

    // Fetch the updated server data
    const updatedServer = await new ServerRepository().findServer(interaction.guildId);

    const embed: APIEmbed = {
      title: 'Configure Roles',
      fields: [
        {
          name: 'Guild Role',
          value: updatedServer.roles?.guildRoleId ? `<@&${updatedServer.roles.guildRoleId}>` : 'Not Set',
        },
        {
          name: 'Absence Role',
          value: updatedServer.roles?.absenceRoleId ? `<@&${updatedServer.roles.absenceRoleId}>` : 'Not Set',
        },
        {
          name: 'Strike Limit Role',
          value: updatedServer.roles?.strikeLimitRoleId ? `<@&${updatedServer.roles.strikeLimitRoleId}>` : 'Not Set',
        },
      ],
      color: 0x00ff00,
    };

    const components = [
      new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
        new RoleSelectMenuBuilder().setCustomId('guild-role').setPlaceholder('Select Guild Role'),
      ),
      new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
        new RoleSelectMenuBuilder().setCustomId('absence-role').setPlaceholder('Select Absence Role'),
      ),
      new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
        new RoleSelectMenuBuilder().setCustomId('strike-limit-role').setPlaceholder('Select Strike Limit Role'),
      ),
    ];

    if (customId === 'configure-roles') {
      await interaction.followUp({
        embeds: [embed],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        components: components as any,
        ephemeral: true,
      });
    } else {
      // Update the interaction with the new embed and components
      await interaction.editReply({
        embeds: [embed],
        components,
      });
    }
  }

  static async setupGuildChannels(channelData: CreationAttributes<Channels>) {
    const logPrefix = 'Setting up guild channels';
    try {
      Logger.info(logPrefix);
      const existingRecord = await channelRepo.findOneByCriteria({ serverId: channelData.serverId });

      if (existingRecord) {
        Logger.info('Channels already configured');
        throw new Error('Channels is already configured');
      } else {
        Logger.info('No Existing Record. Creating Entry');
        channelRepo.createChannels(channelData.serverId, channelData);
      }
    } catch (error) {
      GuildSetup.logAndThrowError(`Error during guild channels setup`, error);
    }
  }

  static async setupGuildRoles(roleData: CreationAttributes<Roles>) {
    const logPrefix = 'Setting up guild roles';
    try {
      Logger.info(logPrefix);
      const existingRecord = await roleRepo.getRoles(roleData.serverId);
      if (existingRecord) {
        Logger.info('Roles already configured');
        throw new Error('Roles is already configured.');
      } else {
        Logger.info('No Existing Record. Creating Entry');
        await roleRepo.createRoles(roleData.serverId, roleData);
      }
    } catch (error) {
      GuildSetup.logAndThrowError(`Error during guild roles setup`, error);
    }
  }
}
