const { guildDb } = require('../utils/database/guild-db');
const { botDb } = require('../utils/database/bot-db');

const addThreeStrikeRole = async (message) => {
  try {
    const serverId = message.guild.id;
    const users = message.mentions.users.map((user) => user);
    let reply = 'The following members has attained 3 strikes:\n\n';

    for (let i = 0; i < users.length; i++) {
      const user = message.mentions.users.first(i + 1)[i];
      const member = message.mentions.members.first(i + 1)[i];
      const userProfile = await guildDb.findOne({
        where: { Name: user.username, UniqueId: user.id, ServerId: serverId },
      });
      if (userProfile.Strikes >= 3) {
        const threeStrikeRole = await botDb.findOne({ where: { Name: '3 Strike Role', ServerId: serverId } });
        member.roles.add(threeStrikeRole.UniqueId);
      }
      reply += `${message.mentions.members.first(i + 1)[i]}`;
    }
    reply += '\n\n Assigning 3 strike roles to the above. An Officer will contact you shortly';
    return reply;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addThreeStrikeRole,
};
