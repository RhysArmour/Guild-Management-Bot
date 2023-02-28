const {
  getStrikes,
  guildDb,
  assignStrikes,
} = require('../utils/database/guild-db');
const { Collection } = require('discord.js');
const { botDb } = require('../utils/database/bot-db');

const isolateTags = (message) => {
  let listOfOffenders = message.mentions.users.map((user) => user.id);
  for (i in listOfOffenders) {
    listOfOffenders[i] = '<@' + listOfOffenders + '>';
  }
  return listOfOffenders;
};

const addThreeStrikeRole = async (message) => {
  const users = isolateTags(message)
  const serverId = message.guild.id
  let reply = 'The following members has attained 3 strikes:\n\n'

  for (i in users) {
      console.log(i)
      let user = message.mentions.users.first(i + 1)[i]
      let member = message.mentions.members.first(i + 1)[i]
      let userProfile = await guildDb.findOne({where: {Name: user.username, UniqueId: user.id, ServerId: serverId}})
      if (userProfile.Strikes >= 3){
          const threeStrikeRole = await botDb.findOne({where: {Name: '3 Strike Role', ServerId: serverId}})
          member.roles.add(threeStrikeRole.UniqueId)
      }
      reply = reply + `${message.mentions.members.first(i + 1)[i]}`;
}
reply = reply + '\n\n Assigning 3 strike roles to the above. An Officer will contact you shortly'
return reply
};

module.exports = {
  addThreeStrikeRole
}