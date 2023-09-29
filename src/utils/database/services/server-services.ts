import { Logger } from '../../../logger';
import prisma from '../prisma';
import { CommandInteraction, GuildMember } from 'discord.js';

export const checkRoomsAreAssigned = async (serverId: string) => {
  const record = await prisma.tickets.findUnique({
    where: { serverId: serverId },
  });
  if (!record) {
    const reply = 'You must set Offense Channel and Strike Channel before issuing strikes.';
    return reply;
  }
  return true;
};

export const registerMembers = async (interaction: CommandInteraction) => {
  Logger.info('Beggining registerMembers');
  const serverId = interaction.guildId;
  let message = 'Registered Members:-';
  let deletedEntries = 'Members removed:-';
  try {
    const guildRoleDb = await prisma.guildRole.findUnique({
      where: { serverId: serverId },
    });
    const newDateTime = new Date().toISOString();
    const guild = await interaction.client.guilds.fetch(serverId);
    const members = (await guild.members.fetch()).map((member) => member);
    Logger.info(`Members List: ${members}`);

    for (const member of members) {
      Logger.info(`Member ${member.user.username} - ${member}`);
      if (member.roles.cache.has(guildRoleDb.guildRoleId)) {
        const absenceStatus = member.roles.cache.has(guildRoleDb.absenceRoleId);
        const memberUpsert = await prisma.members.upsert({
          where: { uniqueId: `${serverId} - ${member.id}` },
          update: { serverId: serverId },
          create: {
            uniqueId: `${serverId} - ${member.id}`,
            serverId: serverId,
            name: member.user.username,
            memberId: member.id,
            strikes: 0,
            lifetimeStrikes: 0,
            absent: absenceStatus,
            currentAbsenceStartDate: '0',
            previousAbsenceDuration: '0',
            createdDate: newDateTime,
            updatedDate: newDateTime,
          },
        });

        if (memberUpsert.createdDate.toISOString() === newDateTime) {
          Logger.info(`New Member ${member.user.username} has been created. Adding to reply message.`);
          message = `${message}\n- ${member.user.username}`;
        }
      } else {
        const memberCheck = await prisma.members.findUnique({
          where: { uniqueId: `${serverId} - ${member.id}` },
        });

        if (memberCheck) {
          Logger.info('Member Exists in Database but does not have Guild Role. Deleting Member');
          await prisma.members.delete({
            where: { uniqueId: `${serverId} - ${member.id}` },
          });
          deletedEntries = `${deletedEntries}\n- ${member.user.username}`;
          Logger.info('Successfully Deleted');
        }
      }
    }
    if (message === 'Registered Members:-') {
      message = `No Members Are Needing Registered`;
    }
    if (deletedEntries === 'Members removed:-') {
      deletedEntries = '';
    }
    message = `${message}\n\n${deletedEntries}`;
    Logger.info(`MESSAGE = ${message}`);
    return message;
  } catch (error) {
    Logger.error(`ERROR: ${error}`);
    return 'Failed to register members due to problem with Bot.';
  }
};
