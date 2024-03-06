import { GuildMember, TextChannel } from 'discord.js';
import { MemberTableServices } from '../database/services/member-services';
import { StrikeReasonsServices } from '../database/services/strike-reason-services';
import { StrikeValuesTableService } from '../database/services/strike-values-services';
import { ServerWithRelations } from '../interfaces/database/server-table-interface';

export const strikeLimitReached = async (member: GuildMember, server: ServerWithRelations) => {
  const { strikeLimitChannelId } = server.channels;
  const { strikeLimit } = server.limits;
  const { strikeReasons } = await MemberTableServices.getAllStrikeReasonsByMember(member);

  const filteredReasons = await StrikeReasonsServices.filterStrikeByResetPeriod(strikeReasons, server);
  const guildStrikeValuesRecord = await StrikeValuesTableService.getAllGuildStrikeValueObjectByServerId(
    member.guild.id,
  );

  const reasonList = await StrikeReasonsServices.getReasonsList(filteredReasons, guildStrikeValuesRecord);

  const message = `YOU ARE NOT BEING KICKED\n\nHey <@${member.id}>. So,  if you're seeing this, you've got ${strikeLimit} (or more) strikes. Here is how we do things.\n\nWe don't want to lose you. We hate booting folks and avoid it where we can.\n\nThis space is a chance for you to let us know if you would like to stay and assure us that we won't be seeing a repeat of your performance from this month. It is also the place to let us know if we are too competitive for you and feel you should move on.\n\nYou have 24 hours to reply to this message otherwise you will be automatically removed from guild and server.\n\nA quick rundown of the strikes\n\n ${reasonList}\n\n(This is a generic message given to all players who get ${strikeLimit} strikes)`;

  const strikeLimitChannel = member.guild?.channels.cache.get(strikeLimitChannelId!.toString()) as TextChannel;
  if (strikeLimitChannel) {
    await strikeLimitChannel.send(message);
  }
};
