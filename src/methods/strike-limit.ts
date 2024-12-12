import { GuildMember, TextChannel } from 'discord.js';
import { MemberTableServices } from '../database/services/member-services';
import { StrikeReasonsServices } from '../database/services/strike-reason-services';
import { ServerWithRelations } from '../interfaces/database/server-table-interface';
import { EmbedBuilder } from '@discordjs/builders';
import { Logger } from '../logger';

export const strikeLimitReached = async (member: GuildMember, server: ServerWithRelations) => {
  try {
    const { strikeLimitChannelId } = server.channels;
    const { strikeLimit } = server.limits;
    const { strikeReasons } = await MemberTableServices.getAllStrikeReasonsByMember(member);

    const filteredReasons = await StrikeReasonsServices.filterStrikeByResetPeriod(strikeReasons, server);

    const reasonList = await StrikeReasonsServices.getReasonsList(filteredReasons);

    const message = `First up, this doesn't mean your being kicked. We don't want to lose you. We hate booting folks and avoid it where we can.\n\nThis space is a chance for you to let us know if you would like to stay and assure us that we won't be seeing a repeat of your performance from this month. It is also the place to let us know if we are too competitive for you and feel you should move on.\n\nYou have 24 hours to reply to this message otherwise you will be automatically removed from guild and server.`;

    const strikeLimitChannel = member.guild?.channels.cache.get(strikeLimitChannelId!.toString()) as TextChannel;
    if (strikeLimitChannel) {
      const reply = new EmbedBuilder()
        .setTitle('Strike Limit Reached')
        .setDescription(
          `If you are seeing this, you have got ${strikeLimit} (or more) strikes. Here is how we do things.`,
        )
        .setFields([
          { name: 'Member', value: `<@${member.id}>` },
          { name: 'Message', value: message },
          { name: 'Strike Rundown', value: `${reasonList}` },
        ])
        .setFooter({ text: `(This is a generic message given to all players who get ${strikeLimit} strikes)` });
      await strikeLimitChannel.send({ embeds: [reply], content: `<@${member.id}>` });
    }
  } catch (error) {
    Logger.info(error);
  }
};
