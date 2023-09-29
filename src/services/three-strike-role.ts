import { PrismaClient } from '@prisma/client';
import { GuildMember, Message, Role, User } from 'discord.js';
import { Logger } from '../logger';

const prisma = new PrismaClient();

const addThreeStrikeRole = async (message: Message): Promise<string> => {
  try {
    const serverId = message.guild.id;
    const users: User[] = message.mentions.users.map((user) => user);
    let reply = 'The following members have attained 3 strikes:\n\n';

    for (let i = 0; i < users.length; i++) {
      const user = message.mentions.users.first(i + 1)?.[i];
      const member = message.mentions.members.first(i + 1)?.[i] as GuildMember;
      const userProfile = await prisma.members.findUnique({
        where: { uniqueId: `${serverId} - ${user.id}` },
      });
      if (userProfile?.strikes && userProfile.strikes >= 3) {
        const threeStrikeRole = await prisma.guildRole.findUnique({
          where: { serverId: serverId },
        });
        if (threeStrikeRole.strikeLimitRoleId) {
          member.roles.add(threeStrikeRole.strikeLimitRoleId.toString());
        }
      }
      reply += `${message.mentions.members.first(i + 1)?.[i]}`;
    }
    reply += '\n\nAssigning 3 strike roles to the above. An Officer will contact you shortly.';
    return reply;
  } catch (error) {
    Logger.error(error);
    throw error;
  }
};

export { addThreeStrikeRole };
