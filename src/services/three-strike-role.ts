import { GuildUserTable } from '../utils/database/models/guild-db';
import { GuildBotData } from '../utils/database/models/bot-db';
import { GuildMember, Message, User } from 'discord.js';

const addThreeStrikeRole = async (message: Message): Promise<string> => {
  try {
    const serverId = message.guild.id;
    const users: User[] = message.mentions.users.map((user) => user);
    let reply = 'The following members have attained 3 strikes:\n\n';

    for (let i = 0; i < users.length; i++) {
      const user = message.mentions.users.first(i + 1)?.[i];
      const member = message.mentions.members.first(i + 1)?.[i] as GuildMember;
      const userProfile = await GuildUserTable.findOne({
        where: { Name: user?.username, UniqueId: user?.id, ServerId: serverId },
      });
      if (userProfile?.strikes && userProfile.strikes >= 3) {
        const threeStrikeRole = await GuildBotData.findOne({ where: {ServerId: serverId } });
        if (threeStrikeRole.strikeLimitRoleId) {
          member.roles.add(threeStrikeRole.strikeLimitRoleId);
        }
      }
      reply += `${message.mentions.members.first(i + 1)?.[i]}`;
    }
    reply += '\n\nAssigning 3 strike roles to the above. An Officer will contact you shortly.';
    return reply;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export { addThreeStrikeRole };
