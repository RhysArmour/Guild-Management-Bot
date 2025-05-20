import { Logger } from '../logger';
import { getLastMonthFullDate } from '../utils/helpers/get-date';
import { APIEmbed } from 'discord.js';
import { Account, Server, Strikes } from '../../db/models';
import { StrikeRepository } from '../database/repositories/strikes-repository';
import { DateTime, Duration } from 'luxon';
import { MemberRepository } from '../database/repositories/member-repository';

export const removeExpiredStrikes = async (server: Server): Promise<APIEmbed> => {
  Logger.info('Starting removeExpiredStrike method', {
    serverId: server.serverId,
    strikeCount: server.strikes.length,
  });

  try {
    const expiryDate = calculateExpiryDate(server);
    const activeStrikes = await new StrikeRepository().findActiveStrikes(server.serverId);
    const expiredStrikes = await processExpiredStrikes(activeStrikes, expiryDate);
    return buildExpiredStrikesEmbed(expiredStrikes);
  } catch (error) {
    Logger.error({ error: error.message }, 'Error during strike reset');
    return {
      title: 'Error During Strike Reset',
      description: 'An error occurred while processing expired strikes. Please check the logs for details.',
      color: 0xff0000, // Red color for error
      timestamp: new Date().toISOString(),
    };
  }
};

export const monthlyStrikeSummary = async (server: Server): Promise<APIEmbed> => {
  const fields = [];
  let totalStrikes = 0;

  for (const member of server.members) {
    if (!member.activeStrikeCount || member.activeStrikeCount < 1) {
      continue;
    }

    totalStrikes += member.activeStrikeCount;

    const existingMember = await new MemberRepository().findById(member.memberId, {
      include: [{ model: Account, as: 'accounts', include: [{ model: Strikes, as: 'strikes' }] }],
    });
    const accountStrikes = existingMember.accounts
      .map(({ displayName, strikes }) => {
        const strikesForAccount = strikes.map((strike) => `> - ${strike.reason} - ${strike.assignedDate}`).join('\n');
        return `> 🛡️  **Account:** ${displayName}\n${strikesForAccount || '>   No strikes for this account.'}`;
      })
      .join('\n\n');
    fields.push({
      name: `👤 ${existingMember.displayName} - ${existingMember.activeStrikeCount} Active Strikes`,
      value: accountStrikes || 'No details available.',
      inline: false,
    });
  }

  if (fields.length === 0) {
    fields.push({
      name: 'No Strikes',
      value: 'No strikes were recorded for the previous month!',
      inline: false,
    });
  }

  return {
    title: `📊 Strike Recap for ${getLastMonthFullDate().toLocaleString('default', { month: 'long' })}`,
    description: `Here's a summary of all strikes issued last month. Total Strikes: **${totalStrikes}**`,
    color: fields[0].name === 'No Strikes' ? 0x00ff00 : 0xff0000,
    fields: fields,
    footer: {
      text: 'Strike system summary',
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Helper function to calculate the expiry date based on the reset period.
 */
const calculateExpiryDate = (server: Server): DateTime => {
  const currentDate = DateTime.now();
  const resetPeriod = Duration.fromISO(server.getDataValue('strikeResetPeriod'));
  Logger.info({ period: resetPeriod }, 'RESET PERIOD');
  const expiryDate = currentDate.minus(resetPeriod);
  Logger.info({ expiryDate: expiryDate.toISO() }, 'Calculated expiry date');
  return expiryDate;
};

/**
 * Helper function to process expired strikes.
 */
const processExpiredStrikes = async (activeStrikes: Strikes[], expiryDate: DateTime): Promise<Strikes[]> => {
  const expiredStrikes = [];

  await Promise.all(
    activeStrikes.map(async (strike) => {
      const strikeDate = DateTime.fromJSDate(new Date(strike.createdAt));
      Logger.info({ strikeId: strike.id, createdAt: strikeDate.toISO() }, 'Processing strike');

      if (strikeDate.toMillis() < expiryDate.toMillis()) {
        Logger.info({ strikeId: strike.id, member: strike.memberId, creationDate: strike.createdAt }, 'Strike expired');
        await strike.update({ active: false });
        expiredStrikes.push({
          member: strike.account.displayName,
          reason: strike.reason,
          createdAt: strikeDate.toFormat('yyyy-MM-dd'),
        });
      } else {
        Logger.info({ strikeId: strike.id, member: strike.member.memberId }, 'Strike not expired');
      }
    }),
  );

  return expiredStrikes;
};

/**
 * Helper function to build an embed for expired strikes.
 */
const buildExpiredStrikesEmbed = (expiredStrikes: Strikes[]): APIEmbed => {
  if (expiredStrikes.length === 0) {
    Logger.info('No expired strikes found');
    return {
      title: 'No Expired Strikes',
      description: 'No strikes have expired today.',
      color: 0x00ff00, // Green color for success
      timestamp: new Date().toISOString(),
    };
  }

  Logger.info('Expired strikes found', { expiredStrikeCount: expiredStrikes.length });

  const fields = expiredStrikes.map((strike) => ({
    name: strike.member,
    value: `**Reason**: ${strike.reason}\n**Issued On**: ${strike.createdAt}`,
    inline: false,
  }));

  return {
    title: 'Expired Strikes Summary',
    description: 'The following strikes have expired during this reset period:',
    color: 0xffa500, // Orange color for warning
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields: fields as any,
    footer: {
      text: 'Strike reset system',
    },
    timestamp: new Date().toISOString(),
  };
};
