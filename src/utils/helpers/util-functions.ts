import { GuildMember } from 'discord.js';
import { Account, Server } from '../../../db/models';
import { MemberRepository } from '../../database/repositories/member-repository';
import { Logger } from '../../logger';
import { APIEmbed, User } from 'discord.js';
import { Member } from '../../../db/models/member';

export const getAccount = async (member: GuildMember, alt?: Account): Promise<Account> => {
  const existingAccount = await new MemberRepository().findById(member.id);

  if (!existingAccount) {
    Logger.error(`Member with ID: ${member.id} is not registered`);
    throw new Error('Member is either not registered.');
  }

  if (alt) {
    return alt;
  }

  return existingAccount.accounts[0];
};

/**
 * Creates a base embed with common properties.
 * @param user The user requesting the embed (used for the footer).
 * @param thumbnailUrl Optional thumbnail URL for the embed.
 * @returns A base embed object.
 */
export const createBaseEmbed = (user: User | null, thumbnailUrl?: string): APIEmbed => {
  if (!user) {
    user = {
      username: 'Guild Management Bot',
      displayAvatarURL: () => null,
    } as User;
  }
  const embed: APIEmbed = {
    color: 0x0099ff, // Default color (can be overridden)
    footer: {
      text: `Requested by ${user.username}`,
      icon_url: user.displayAvatarURL(),
    },
    timestamp: new Date().toISOString(),
  };

  // Add thumbnail if provided
  if (thumbnailUrl) {
    embed.thumbnail = { url: thumbnailUrl };
  }

  return embed;
};

/**
 * Generates a strike-related embed for active strikes.
 * @param server The server object containing server-specific information.
 * @param user The user requesting the embed (used for the footer).
 * @param discordUser The user for the avatar.
 * @param member The member whose strikes are being displayed.
 * @param accounts The accounts associated with the member.
 * @param totalActiveStrikes Total active strikes for the member.
 * @param title The title of the embed.
 * @param description The description of the embed.
 * @returns A strike-related embed.
 */
export const generateStrikeDetailsEmbed = (
  server: Server,
  user: User | null,
  discordUser: GuildMember,
  member: Member,
  accounts: Account[],
  totalActiveStrikes: number,
  title: string,
  description: string,
): APIEmbed => {
  const embed = createBaseEmbed(user, discordUser?.displayAvatarURL());
  embed.title = title;
  embed.description = description;
  embed.color =
    totalActiveStrikes === 0
      ? 0x00ff00 // Green for no active strikes
      : totalActiveStrikes > 0 && totalActiveStrikes < server.strikeLimit
      ? 0xffcc00 // Yellow for active strikes within the limit
      : 0xff0000; // Red for active strikes exceeding the limit

  // Add total active strikes field
  embed.fields = [
    {
      name: ':x: Total Active Strikes',
      value: `${totalActiveStrikes}`,
      inline: true,
    },
  ];

  // Add account and active strike details
  for (const account of accounts) {
    const accountStrikes = account.strikes?.filter((strike) => strike.active) || [];
    const strikeDetails = accountStrikes
      .map(
        (strike, index) =>
          `:x: **Strike ${index + 1}:** ${strike.reason} (${strike.assignedDate.toISOString().split('T')[0]})`,
      )
      .join('\n');

    embed.fields.push({
      name: `🛡️ Account: ${account.displayName} (${account.allyCode})`,
      value: strikeDetails || 'No active strikes for this account.',
      inline: false,
    });
  }

  return embed;
};
