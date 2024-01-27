import { CommandInteraction, InteractionType } from 'discord.js';
import { Logger } from '../logger';
import { IGuildChannels, IGuildRoles, IGuildLimits, IGuildServer } from '../interfaces/methods/bot-setup';
import { ChannelTableService } from '../database/services/channel-services';
import { RoleTableService } from '../database/services/role-services';
import { LimitsTableService } from '../database/services/limits-services';
import { ServerTableService } from '../database/services/server-services';

export class GuildSetup {
  private static logAndThrowError(message: string, error: Error): void {
    Logger.error(message, error);
    throw new Error(message);
  }

  private static isApplicationCommand(interaction: CommandInteraction): boolean {
    return interaction.type === InteractionType.ApplicationCommand && interaction.isChatInputCommand();
  }

  static async setupGuildChannels(interaction: CommandInteraction, channelData: IGuildChannels) {
    if (!GuildSetup.isApplicationCommand(interaction)) {
      return 'Cannot complete setup. Interaction is not an Application Command';
    }

    const logPrefix = 'Setting up guild channels';
    try {
      Logger.info(logPrefix);
      const existingRecord = await ChannelTableService.getChannelsByServerId(interaction.guildId);

      if (existingRecord) {
        Logger.info('Record exists. Updating with new values.');
        ChannelTableService.updateChannelEntryByInteraction(interaction, channelData);
      } else {
        Logger.info('No Existing Record. Creating Entry');
        ChannelTableService.createChannelEntryByInteraction(interaction, channelData);
      }
    } catch (error) {
      GuildSetup.logAndThrowError(`Error during guild channels setup`, error);
    }
  }

  static async setupGuildRoles(interaction: CommandInteraction, roleData: IGuildRoles) {
    if (!GuildSetup.isApplicationCommand(interaction)) {
      return 'Cannot complete setup. Interaction is not an Application Command';
    }

    const logPrefix = 'Setting up guild roles';
    try {
      Logger.info(logPrefix);
      const existingRecord = await RoleTableService.getRolesByServerId(interaction.guildId);

      if (existingRecord) {
        Logger.info('Record exists. Updating with new values.');
        await RoleTableService.updateGuildRolesEntryByInteraction(interaction, roleData);
      } else {
        Logger.info('No Existing Record. Creating Entry');
        await RoleTableService.createGuildRolesByInteraction(interaction, roleData);
      }
    } catch (error) {
      GuildSetup.logAndThrowError(`Error during guild roles setup`, error);
    }
  }

  static async setupGuildLimits(interaction: CommandInteraction, limitsData: IGuildLimits) {
    if (!GuildSetup.isApplicationCommand(interaction)) {
      return 'Cannot complete setup. Interaction is not an Application Command';
    }

    const logPrefix = 'Setting up guild limits';
    try {
      Logger.info(logPrefix);
      const existingRecord = await LimitsTableService.getLimitsByServerId(interaction.guildId);

      if (existingRecord) {
        Logger.info('Record exists. Updating with new values.');
        await LimitsTableService.updateGuildLimitsEntryByInteraction(interaction, limitsData);
      } else {
        Logger.info('No Existing Record. Creating Entry');
        await LimitsTableService.createGuildLimitsByInteraction(interaction, limitsData);
      }
    } catch (error) {
      GuildSetup.logAndThrowError(`Error during guild limits setup`, error);
    }
  }

  static async setupGuildServer(interaction: CommandInteraction, serverData: IGuildServer) {
    if (!GuildSetup.isApplicationCommand(interaction)) {
      return 'Cannot complete setup. Interaction is not an Application Command';
    }

    try {
      Logger.info('Setting up guild server');
      const existingRecord = await ServerTableService.getServerTableByServerId(interaction.guildId);

      if (existingRecord) {
        Logger.info('Record exists. Updating with new values.');
        await ServerTableService.updateServerTableEntryByInteraction(interaction, serverData);
      } else {
        Logger.info('No Existing Record. Creating Entry');
        await ServerTableService.createServerTableEntryByInteractionWithData(interaction, serverData);
      }
    } catch (error) {
      GuildSetup.logAndThrowError(`Error during guild limits setup`, error);
    }
  }
}
