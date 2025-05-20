import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { DiscordUserRepository } from '../../database/repositories/user-repository';
import { ApplicationCommandOptionType } from 'discord.js';
import { Account, Strikes } from '../../../db';

export default new Command({
  name: 'userdata',
  description: 'Retrieves all data stored in the database for a given Discord user',
  options: [
    {
      name: 'user',
      description: 'The Discord user you want to retrieve data for',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],

  execute: async ({ interaction }) => {
    try {
      Logger.info('Beginning data retrieval for user');
      const user = interaction.options.getUser('user');

      if (!user) {
        throw new Error('User not found');
      }

      const userData = await new DiscordUserRepository().findByDiscordId(user.id, {
        include: [{ model: Account, as: 'accounts', include: [{ model: Strikes, as: 'strikes' }] }],
      });

      if (!userData) {
        return {
          title: 'User Data',
          fields: [{ name: 'Message', value: 'No data found for the specified user.' }],
        };
      }


      const accounts = userData.accounts
        .map((account, index) => {
          const label = account.alt
            ? `- Alt ${userData.accounts.filter((acc) => acc.alt && userData.accounts.indexOf(acc) <= index).length}`
            : '- Primary';

          const activeStrikes = account.strikes.filter((strike) => strike.active);
          const activeStrikesText = activeStrikes.length
            ? activeStrikes.map((strike, index) => `${index + 1}. ${strike.reason}`).join('\n')
            : 'No active strikes';

          return `${label}:\n  - Ally Code: ${account.allyCode}\n  - Player Name: ${account.displayName}\n  - Active Strike Count: ${account.activeStrikeCount}\n  - Lifetime Strikes: ${account.totalLifetimeStrikes}\n  - Active Strikes: ${activeStrikesText}`;
        })
        .join('\n\n');

      const result = {
        title: 'User Data',
        fields: [
          { name: 'Discord ID', value: userData.discordId },
          { name: 'Username', value: userData.userName },
          { name: 'Display Name', value: userData.displayName },
          { name: 'Accounts', value: accounts },
          { name: 'Active Strike Count', value: userData.activeStrikeCount.toString() },
          { name: 'Lifetime Strikes', value: userData.totalLifetimeStrikes.toString() },
        ],
      };

      Logger.info('Data retrieval completed');
      return result;
    } catch (error) {
      Logger.error(`Error: ${error}`);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occurred whilst retrieving user data.' }],
      };
    }
  },
});

