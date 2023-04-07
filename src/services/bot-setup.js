const { botDb } = require('../utils/database/bot-db');

const channelSetup = async (interaction) => {
  console.log('Channel Setup');
  const serverId = interaction.guild.id;

  const duplicateChannel = await botDb.findOne({
    where: { Name: 'Ticket Offense Channel', ServerId: serverId },
  });

  const offenseChannel = interaction.options.getChannel('ticketoffensechannel');
  const strikeChannel = interaction.options.getChannel('strikechannel');

  try {
    if (duplicateChannel) {
      await botDb.update(
        { Value: offenseChannel.name, UniqueId: offenseChannel.id },
        { where: { Name: 'Ticket Offense Channel', ServerId: serverId } },
      );
      await botDb.update(
        { Value: strikeChannel.name, UniqueId: strikeChannel.id },
        { where: { Name: 'Strike Channel', ServerId: serverId } },
      );
      return `Ticket Offense Channel updated to "${offenseChannel.name}" and Strike Channel updated to "${strikeChannel.name}"`;
    }
    await botDb.create({
      Name: 'Ticket Offense Channel',
      Description: null,
      Value: offenseChannel.name,
      UniqueId: offenseChannel.id,
      ServerId: serverId,
    });
    await botDb.create({
      Name: 'Strike Channel',
      Description: null,
      Value: strikeChannel.name,
      UniqueId: strikeChannel.id,
      ServerId: serverId,
    });
    return `Ticket Offense Channel set to "${offenseChannel.name}" and Strike Channel set to "${strikeChannel.name}"`;
  } catch (error) {
    console.log('ERROR', error);
  }
};

const awayRoleSetup = async (interaction) => {
  console.log('Away Role Setup');
  const awayRole = interaction.options.getRole('awayrole');
  const serverId = interaction.guild.id;

  const duplicateAwayRole = await botDb.findOne({
    where: { Name: 'Away Role', ServerId: serverId },
  });

  try {
    if (duplicateAwayRole) {
      await botDb.update(
        { Value: awayRole.name, UniqueId: awayRole.id },
        { where: { Name: 'Away Role', ServerId: serverId } },
      );
      return `Away role updated to "${awayRole.name}"`;
    }
    await botDb.create({
      Name: 'Away Role',
      Description: null,
      Value: awayRole.name,
      UniqueId: awayRole.id,
      ServerId: serverId,
    });
    return `Away role set to "${awayRole.name}"`;
  } catch (error) {
    console.log('ERROR', error);
  }
};

const threeStrikeRoleSetup = async (interaction) => {
  console.log('Three Strike Role Setup');
  const threeStrikeRole = interaction.options.getRole('3strikerole');
  const serverId = interaction.guild.id;

  console.log('SERVERID', serverId);

  const duplicateThreeStrikeRole = await botDb.findOne({
    where: { Name: '3 Strike Role', ServerId: serverId },
  });

  try {
    if (duplicateThreeStrikeRole) {
      await botDb.update(
        { Value: threeStrikeRole.name, UniqueId: threeStrikeRole.id },
        { where: { Name: '3 Strike Role', ServerId: serverId } },
      );
      return `3 strike role updated to "${threeStrikeRole.name}"`;
    }
    await botDb.create({
      Name: '3 Strike Role',
      Description: null,
      Value: threeStrikeRole.name,
      UniqueId: threeStrikeRole.id,
      ServerId: serverId,
    });
    return `3 strike role set to "${threeStrikeRole.name}"`;
  } catch (error) {
    console.log('ERROR', error);
  }
};

const triggerSetup = async (interaction) => {
  console.log('Trigger Setup');
  const alert = interaction.options.getString('triggerphrase');
  const serverId = interaction.guild.id;
  console.log('SERVERID', serverId);

  const duplicateTrigger = await botDb.findOne({
    where: { Name: 'Trigger Message', ServerId: serverId },
  });

  try {
    if (duplicateTrigger) {
      await botDb.update(
        { Value: alert, UniqueId: alert.id },
        { where: { Name: 'Trigger Message', ServerId: serverId } },
      );
      return `Trigger Message updated to "${alert}"`;
    }
    await botDb.create({
      Name: 'Trigger Message',
      Description: null,
      Value: alert,
      UniqueId: null,
      ServerId: serverId,
    });
    return `Trigger message set to "${alert}"`;
  } catch (error) {
    console.log('ERROR', error);
  }
};

module.exports = {
  channelSetup,
  awayRoleSetup,
  threeStrikeRoleSetup,
  triggerSetup,
};
