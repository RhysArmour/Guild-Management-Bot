import { ChatInputCommandInteraction, APIEmbed, User } from 'discord.js';
import { Server, Account, Strikes, Member } from '../../db';
import { MemberRepository } from '../database/repositories/member-repository';
import { Logger } from '../logger';
import { createBaseEmbed, generateStrikeDetailsEmbed } from '../utils/helpers/util-functions';
import { StrikeEmbedFactory } from '../classes/embed-factory';
import { StrikeRepository } from '../database/repositories/strikes-repository';

export const checkActiveStrikes = async (
  interaction: ChatInputCommandInteraction,
  server: Server,
): Promise<APIEmbed[]> => {
  try {
    Logger.info('Checking for Active Strikes.');

    const embeds: APIEmbed[] = [];
    const length = interaction.options.data[0].options.length;

    Logger.info(`Processing ${length} user(s) from interaction options.`);

    for (let i = 0; i < length; i += 1) {
      const discordMember = interaction.options.getUser(`user${i + 1}`);

      if (!discordMember) {
        Logger.warn(`No Discord member found for user${i + 1}. Skipping.`);
        continue;
      }

      Logger.info(`Fetching data for Discord member: ${discordMember.displayName} (ID: ${discordMember.id})`);

      const memberRecord = await new MemberRepository().findById(`${server.serverId}-${discordMember.id}`, {
        include: [
          {
            model: Account,
            as: 'accounts',
            include: [{ model: Strikes, as: 'strikes' }],
          },
        ],
      });

      if (!memberRecord) {
        Logger.error(`No Member found with Discord ID: ${discordMember.id}`);
        embeds.push({
          title: `No Member Found`,
          description: `No Member registered with name: ${discordMember.displayName}`,
          color: 0xffcc00, // Yellow for warnings
        });
        continue;
      }

      Logger.info(`Processing info for member ID: ${memberRecord.discordId}, name: ${memberRecord.displayName}`);

      // Calculate total active strikes
      let totalActiveStrikes = 0;

      for (const account of memberRecord.accounts || []) {
        const accountStrikes = account.strikes?.filter((strike) => strike.active) || [];
        totalActiveStrikes += accountStrikes.length;
      }

      Logger.info(`Calculated Total Active Strikes: ${totalActiveStrikes}`);

      // Sort accounts: primary first, then alts
      const sortedAccounts = memberRecord.accounts.sort((a, b) => {
        if (a.alt === b.alt) {
          return a.displayName.localeCompare(b.displayName); // Secondary sort by displayName
        }
        return a.alt ? 1 : -1; // If `alt` is true, it goes after `alt: false`
      });

      Logger.info(`Sorted ${sortedAccounts.length} account(s) for member ${memberRecord.displayName}.`);

      const discordUser = interaction.guild.members.cache.find((member) => member.id === memberRecord.discordId);

      // Generate the embed
      const embed = generateStrikeDetailsEmbed(
        server,
        interaction.user,
        discordUser,
        memberRecord,
        sortedAccounts,
        totalActiveStrikes,
        `⚡ Active Strike Data for ${memberRecord.displayName}`,
        `Here is a detailed breakdown of ${memberRecord.displayName}'s active strikes.`,
      );

      embeds.push(embed);
    }

    Logger.info(`Generated ${embeds.length} embed(s) for active strikes.`);
    return embeds;
  } catch (error) {
    Logger.error(`Error in 'checkActiveStrikes': ${error}`);
    throw error;
  }
};

export const strikeHistory = async (
  interaction: ChatInputCommandInteraction,
  server: Server,
  discordUser: User,
): Promise<APIEmbed | null> => {
  try {
    Logger.info(`Fetching strike history for user: ${discordUser.displayName} (ID: ${discordUser.id})`);

    // Fetch the discordUser with related data
    const member = await new MemberRepository().findById(`${server.serverId}-${discordUser.id}`, {
      include: [
        {
          model: Account,
          as: 'accounts',
          include: [{ model: Strikes, as: 'strikes' }],
        },
      ],
    });

    if (!member) {
      Logger.warn(`No discordUser found for user: ${discordUser.displayName} (ID: ${discordUser.id})`);
      return null;
    }

    Logger.info(`Found discordUser for user: ${member.displayName} (ID: ${member.discordId})`);

    // Calculate total active and historical strikes
    let totalActiveStrikes = 0;
    let totalHistoricalStrikes = 0;

    for (const account of member.accounts || []) {
      const accountStrikes = account.strikes || [];
      totalActiveStrikes += accountStrikes.filter((strike) => strike.active).length;
      totalHistoricalStrikes += accountStrikes.length;
    }

    Logger.info(
      `Calculated Total Active Strikes: ${totalActiveStrikes}, Total Historical Strikes: ${totalHistoricalStrikes}`,
    );

    // Sort accounts: primary first, then alts
    const sortedAccounts = member.accounts.sort((a, b) => {
      if (a.alt === b.alt) {
        return a.displayName.localeCompare(b.displayName); // Secondary sort by displayName
      }
      return a.alt ? 1 : -1; // If `alt` is true, it goes after `alt: false`
    });

    Logger.info(`Sorted ${sortedAccounts.length} account(s) for member ${member.displayName}.`);

    // Create the base embed
    const embed = createBaseEmbed(interaction.user, discordUser.displayAvatarURL());

    // Add title and description
    embed.title = `⚡ Strike History for ${member.displayName}`;
    embed.description = `Here is a detailed breakdown of ${member.displayName}'s strike history.`;
    embed.color = totalActiveStrikes > 0 ? 0xff0000 : 0x00ff00; // Red for active strikes, green otherwise

    // Add total strikes fields
    embed.fields = [
      {
        name: ':x: Total Active Strikes',
        value: `${totalActiveStrikes}`,
        inline: true,
      },
      {
        name: '📜 Total Historical Strikes',
        value: `${totalHistoricalStrikes}`,
        inline: true,
      },
    ];

    // Add account and strike details
    for (const account of sortedAccounts) {
      const accountStrikes = account.strikes || [];
      const strikeDetails = accountStrikes
        .map(
          (strike, index) =>
            `${strike.active ? ':x:' : '📜'} **Strike ${index + 1}:** ${strike.reason} (${
              strike.assignedDate.toISOString().split('T')[0]
            })`,
        )
        .join('\n');

      embed.fields.push({
        name: `🛡️ Account: ${account.displayName} (${account.allyCode})`,
        value: strikeDetails || 'No strikes for this account.',
        inline: false,
      });
    }

    Logger.info(`Generated strike history embed for user: ${discordUser.displayName}`);
    return embed;
  } catch (error) {
    Logger.error(
      `Error fetching strike history for user: ${discordUser.displayName} (ID: ${discordUser.id}): ${error}`,
    );
    throw error;
  }
};

export function groupStrikesByMember(activeStrikes: Strikes[]): Record<
  string,
  {
    member: Member;
    accounts: Record<
      string,
      {
        account: Account;
        strikes: Strikes[];
      }
    >;
  }
> {
  return activeStrikes.reduce((acc, strike) => {
    const memberId = strike.account.member.memberId;
    if (!acc[memberId]) {
      acc[memberId] = {
        member: strike.account.member,
        accounts: {},
      };
    }
    const accountId = strike.account.playerId;
    if (!acc[memberId].accounts[accountId]) {
      acc[memberId].accounts[accountId] = {
        account: strike.account,
        strikes: [],
      };
    }
    acc[memberId].accounts[accountId].strikes.push(strike);
    return acc;
  }, {});
}

export function generateCheckAllEmbed(server: Server, strikesByMember: Record<
  string,
  {
    member: Member;
    accounts: Record<
      string,
      {
        account: Account;
        strikes: Strikes[];
      }
    >;
  }
>) {
  return {
    title: 'Guild Strikes',
    description: `Here are all active strikes for all members for the past ${server.strikeResetPeriod}:`,
    color: 0xff0000,
    fields: Object.values(strikesByMember).map(({ member, accounts }) => {
      const accountStrikes = Object.values(accounts)
        .map(
          ({ account, strikes }) =>
            `> 🛡️  **Account:** ${account.displayName}\n${strikes
              .map((strike) => `>   - ${strike.reason}`)
              .join('\n')}`,
        )
        .join('\n\n');
      return {
        name: `👤 **Member:** ${member.displayName} - ${':x:'.repeat(member.activeStrikeCount)}`,
        value: accountStrikes,
        inline: false,
      };
    }),
    footer: {
      text: `Strike Reset Period: ${server.strikeResetPeriod}`,
    },
  };
}

export async function handleCheckAllSubcommand(interaction: ChatInputCommandInteraction, server: Server) {
  Logger.info('Executing check-all strikes subcommand...');
  try {
    const activeStrikes = await new StrikeRepository().findActiveStrikes(server.serverId, {
      include: [
        {
          model: Account,
          as: 'account',
          include: [{ model: Member, as: 'member' }],
        },
      ],
    });

    if (activeStrikes.length === 0) {
      Logger.info('No active strikes found for the server.');
      const embed = StrikeEmbedFactory.createSadPathEmbed(
        'Check All Strikes',
        'There are no active strikes for this server.',
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const strikesByMember = groupStrikesByMember(activeStrikes);
    const embed = generateCheckAllEmbed(server, strikesByMember);
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    Logger.error(`Error executing check-all strikes subcommand: ${error}`);
    const embed = StrikeEmbedFactory.createSadPathEmbed(
      'Check All Strikes',
      'An error occurred while fetching active strikes.',
    );
    await interaction.editReply({ embeds: [embed] });
  }
}
