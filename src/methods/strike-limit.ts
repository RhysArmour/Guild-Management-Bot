import { GuildMember, TextChannel } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';
import { Logger } from '../logger';
import { Account, Server, Strikes } from '../../db/models';
import { MemberRepository } from '../database/repositories/member-repository';

export const strikeLimitReached = async (member: GuildMember, server: Server) => {
  try {
    const { strikeLimitChannelId } = server.channels;
    const existingMember = await new MemberRepository().findOneByCriteria(
      { discordId: member.id },
      {
        include: [{ model: Account, as: 'accounts', include: [{ model: Strikes, as: 'strikes' }] }],
      },
    );

    const { accounts } = existingMember;

    // Build a formatted list of active strikes by account
    const accountStrikeList = accounts
      .map((account) => {
        const activeStrikes = account.strikes.filter((strike) => strike.active);
        if (activeStrikes.length === 0) return null;
        const strikesList = activeStrikes
          .map(
            (strike, idx) =>
              `> **${idx + 1}.** ${strike.reason}  \`${
                strike.assignedDate ? new Date(strike.assignedDate).toLocaleDateString() : ''
              }\``,
          )
          .join('\n');
        return `🛡️ **${account.displayName}** \`[${account.allyCode}]\`\n${strikesList}`;
      })
      .filter(Boolean)
      .join('\n\n');

    const message = [
      '⚠️ **Strike Limit Reached!**',
      '',
      "First up, this doesn't mean you're being kicked. We don't want to lose you. We hate booting folks and avoid it where we can.",
      '',
      "This space is a chance for you to let us know if you would like to stay and assure us that we won't be seeing a repeat of your performance from this month.",
      'It is also the place to let us know if we are too competitive for you and you feel you should move on.',
      '',
      '⏳ **You have 24 hours to reply to this message otherwise you will be automatically removed from guild and server.**',
    ].join('\n');

    const strikeLimitChannel = member.guild?.channels.cache.get(strikeLimitChannelId!.toString()) as TextChannel;
    if (strikeLimitChannel) {
      const reply = new EmbedBuilder()
        .setTitle('🚨 Strike Limit Reached!')
        .setColor(0xff5555)
        .setDescription(
          `You have reached **${server.strikeLimit}** or more strikes.\n\nHere is a summary of your current situation:`,
        )
        .addFields(
          { name: '👤 Member', value: `<@${member.id}>`, inline: true },
          { name: '📝 Message', value: message, inline: false },
          { name: '📋 Strike Rundown', value: accountStrikeList || '✅ No active strikes found.', inline: false },
        )
        .setFooter({ text: `This is a generic message given to all players who get ${server.strikeLimit} strikes.` })
        .setTimestamp();

      await strikeLimitChannel.send({ embeds: [reply], content: `<@${member.id}>` });
    }
  } catch (error) {
    Logger.info(error);
  }
};
