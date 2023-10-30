// import { GuildMember, TextChannel } from 'discord.js';
// import { getGuildRoles } from '../database/services/role-services';
// import { getStrikeRecord } from '../database/services/limits-services';
// import { getMember } from '../database/services/member-services';
// import currentDate from '../utils/helpers/get-date';

// export const strikeLimitReached = async (member: GuildMember) => {
//   const { strikeLimitRoleId } = await getGuildRoles(member.guild.id);
//   const { strikeLimitChannelId } = await getStrikeRecord(member.guild.id);
//   const { strikeReasons } = await getMember(member);
//   const { month, year } = currentDate();

//   let strikes = ``;

//   for (const i in strikeReasons) {
//     if (strikeReasons[i].date.includes(month) && strikeReasons[i].date.includes(year.toString())) {
//       strikes = `${strikes}\n${strikeReasons[i].date} - ${strikeReasons[i].reason}}`;
//     }
//   }

//   member.roles.add(strikeLimitRoleId);

//   const message = `YOU ARE NOT BEING KICKED\n

//   \nHey ${member.user.tag}. So,  if you're seeing this, you've got 3 (or more) strikes. Here is how we do things.\n 
  
//   \nWe don't want to lose you. We hate booting folks and avoid it where we can.\n
  
//   \nThis space is a chance for you to let us know if you would like to stay and assure us that we won't be seeing a repeat of your performance from this month. It is also the place to let us know if we are too competitive for you and feel you should move on.\n
  
//   \nYou have 24 hours to reply to this message otherwise you will be automatically removed from guild and server.\n
  
//   \nA quick rundown of the strikes\n
  
//   \n${strikes}\n
  
//   \n(This is a generic message given to all players who get 3 strikes) 
//   `;

//   const strikeLimitChannel = member.guild?.channels.cache.get(strikeLimitChannelId!.toString()) as TextChannel;
//   if (strikeLimitChannel) {
//     await strikeLimitChannel.send(message);
//   }
// };
