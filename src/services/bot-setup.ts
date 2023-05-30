import { GuildBotData } from '../utils/database/models/bot-db';
import { CommandInteraction, InteractionType, Role, TextChannel } from 'discord.js';
import { Logger } from '../logger';

const channelSetup = async (interaction: CommandInteraction) => {
  Logger.info('Channel Setup');

  if (interaction.type !== InteractionType.ApplicationCommand) return;
  if (!interaction.isChatInputCommand()) return;

  const serverId = interaction.guild!.id;

  const guildBotData = await GuildBotData.findOne({
    where: { ServerId: serverId },
  });

  const offenseChannel = interaction.options.getChannel('ticketoffensechannel') as TextChannel;
  const strikeChannel = interaction.options.getChannel('strikechannel') as TextChannel;

  try {
    if (guildBotData) {
      await GuildBotData.update(
        { Value: offenseChannel.name, UniqueId: offenseChannel.id },
        { where: { Name: 'Ticket Offense Channel', ServerId: serverId } },
      );
      await GuildBotData.update(
        { Value: strikeChannel.name, UniqueId: strikeChannel.id },
        { where: { Name: 'Strike Channel', ServerId: serverId } },
      );
      return `Ticket Offense Channel updated to "${offenseChannel.name}" and Strike Channel updated to "${strikeChannel.name}"`;
    }
    await GuildBotData.create({
      Name: 'Ticket Offense Channel',
      Description: null,
      Value: offenseChannel.name,
      UniqueId: offenseChannel.id,
      ServerId: serverId,
    });
    await GuildBotData.create({
      Name: 'Strike Channel',
      Description: null,
      Value: strikeChannel.name,
      UniqueId: strikeChannel.id,
      ServerId: serverId,
    });
    return `Ticket Offense Channel set to "${offenseChannel.name}" and Strike Channel set to "${strikeChannel.name}"`;
  } catch (error) {
    Logger.info('ERROR', error);
  }
};

const awayRoleSetup = async (interaction: CommandInteraction) => {
  Logger.info('Away Role Setup');
  if (interaction.type !== InteractionType.ApplicationCommand) return;
  if (!interaction.isChatInputCommand()) return;
  const awayRole = interaction.options.getRole('awayrole') as Role;
  const serverId = interaction.guild!.id;

  const duplicateAwayRole = await GuildBotData.findOne({
    where: { Name: 'Away Role', ServerId: serverId },
  });

  try {
    if (duplicateAwayRole) {
      await GuildBotData.update(
        { Value: awayRole.name, UniqueId: awayRole.id },
        { where: { Name: 'Away Role', ServerId: serverId } },
      );
      return `Away role updated to "${awayRole.name}"`;
    }
    await GuildBotData.create({
      Name: 'Away Role',
      Description: null,
      Value: awayRole.name,
      UniqueId: awayRole.id,
      ServerId: serverId,
    });
    return `Away role set to "${awayRole.name}"`;
  } catch (error) {
    Logger.info('ERROR', error);
  }
};

const threeStrikeRoleSetup = async (interaction: CommandInteraction) => {
  Logger.info('Three Strike Role Setup');
  if (interaction.type !== InteractionType.ApplicationCommand) return;
  if (!interaction.isChatInputCommand()) return;
  const threeStrikeRole = interaction.options.getRole('3strikerole') as Role;
  const serverId = interaction.guild!.id;

  Logger.info('SERVERID', serverId);

  const duplicateThreeStrikeRole = await GuildBotData.findOne({
    where: { Name: '3 Strike Role', ServerId: serverId },
  });

  try {
    if (duplicateThreeStrikeRole) {
      await GuildBotData.update(
        { Value: threeStrikeRole.name, UniqueId: threeStrikeRole.id },
        { where: { Name: '3 Strike Role', ServerId: serverId } },
      );
      return `3 strike role updated to "${threeStrikeRole.name}"`;
    }
    await GuildBotData.create({
      Name: '3 Strike Role',
      Description: null,
      Value: threeStrikeRole.name,
      UniqueId: threeStrikeRole.id,
      ServerId: serverId,
    });
    return `3 strike role set to "${threeStrikeRole.name}"`;
  } catch (error) {
    Logger.info('ERROR', error);
  }
};

const triggerSetup = async (interaction: CommandInteraction) => {
  Logger.info('Trigger Setup');
  if (interaction.type !== InteractionType.ApplicationCommand) return;
  if (!interaction.isChatInputCommand()) return;
  const alert = interaction.options.getString('triggerphrase')!;
  const serverId = interaction.guild!.id;
  Logger.info('SERVERID', serverId);

  const duplicateTrigger = await GuildBotData.findOne({
    where: { Name: 'Trigger Message', ServerId: serverId },
  });

  try {
    if (duplicateTrigger) {
      await GuildBotData.update(
        { Value: alert, UniqueId: alert },
        { where: { Name: 'Trigger Message', ServerId: serverId } },
      );
      return `Trigger Message updated to "${alert}"`;
    }
    await GuildBotData.create({
      Name: 'Trigger Message',
      Description: null,
      Value: alert,
      UniqueId: null,
      ServerId: serverId,
    });
    return `Trigger message set to "${alert}"`;
  } catch (error) {
    Logger.info('ERROR', error);
  }
};

export { channelSetup, awayRoleSetup, threeStrikeRoleSetup, triggerSetup };
