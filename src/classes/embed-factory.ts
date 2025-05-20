import { APIEmbed, GuildMember, User } from 'discord.js';
import { Server, Member, Account } from '../../db';

export class EmbedFactory {
  /**
   * Creates a base embed with common properties.
   * @param title The title of the embed.
   * @param description The description of the embed.
   * @param color The color of the embed (default: green for success).
   * @param footer Optional footer text.
   * @returns A base embed object.
   */
  static createBaseEmbed({
    title,
    description,
    color = 0x00ff00, // Default to green for success
    footer,
  }: {
    title: string;
    description: string;
    color?: number;
    footer?: string;
  }): APIEmbed {
    return {
      title,
      description,
      color,
      timestamp: new Date().toISOString(),
      footer: footer ? { text: footer } : undefined,
    };
  }

  /**
   * Creates a sad path embed for error scenarios.
   * @param command The name of the command.
   * @param failureReason The reason for the failure.
   * @returns A sad path embed object.
   */
  static createSadPathEmbed(command: string, failureReason: string): APIEmbed {
    return this.createBaseEmbed({
      title: `${command} Command`,
      description: `❌ ${failureReason}`,
      color: 0xff0000, // Red for errors
    });
  }

  /**
   * Creates a happy path embed for success scenarios.
   * @param command The name of the command.
   * @param successMessage The success message.
   * @returns A happy path embed object.
   */
  static createHappyPathEmbed(command: string, successMessage: string): APIEmbed {
    return this.createBaseEmbed({
      title: `${command} Command`,
      description: `✅ ${successMessage}`,
      color: 0x00ff00, // Green for success
    });
  }
}

export class StrikeEmbedFactory extends EmbedFactory {
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
  static generateStrikeDetailsEmbed(
    server: Server,
    user: User,
    discordUser: GuildMember,
    member: Member,
    accounts: Account[],
    totalActiveStrikes: number,
    title: string,
    description: string,
  ): APIEmbed {
    const embed = this.createBaseEmbed({
      title,
      description,
      color:
        totalActiveStrikes === 0
          ? 0x00ff00 // Green for no active strikes
          : totalActiveStrikes > 0 && totalActiveStrikes < server.strikeLimit
          ? 0xffcc00 // Yellow for active strikes within the limit
          : 0xff0000, // Red for active strikes exceeding the limit
      footer: `Requested by ${user.username}`,
    });

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
  }

  /**
   * Generates a sad path embed for the "check-all" subcommand.
   * @returns A sad path embed for no active strikes.
   */
  static createCheckAllSadPathEmbed(): APIEmbed {
    return this.createSadPathEmbed('Check All Strikes', 'There are no active strikes for this server.');
  }

  /**
   * Generates a happy path embed for the "check-all" subcommand.
   * @param server The server object containing server-specific information.
   * @param description The description of the embed.
   * @returns A happy path embed for active strikes.
   */
  static createCheckAllHappyPathEmbed(server: Server, description: string): APIEmbed {
    return this.createBaseEmbed({
      title: 'Guild Strikes',
      description,
      color: 0x00ff00, // Green for success
      footer: `Strike Reset Period: ${server.strikeResetPeriod}`,
    });
  }
}

