import { FindOptions } from 'sequelize';
import { BaseRepository } from './base-repository';
import { Account } from '../../../db/models/account';
import { PlayerData } from '../../interfaces/comlink/playerData';
import { Logger } from '../../logger';
import { MemberRepository } from './member-repository';
import { DiscordUser, Member, Server, Strikes } from '../../../db';

export class AccountRepository extends BaseRepository<Account> {
  constructor() {
    super(Account);
  }

  /**
   * Create a new account for a DiscordUser.
   * @param discordId - The DiscordUser's unique identifier
   * @param data - The account creation data
   */
  async createPrimaryAccount(discordId: string, serverId: string, data: PlayerData): Promise<Account> {
    Logger.info(`Attempting to create account for Discord ID: ${discordId} with Ally Code: ${data.allyCode}`);
    const existingAccount = await this.findByAllyCode(data.allyCode);

    if (existingAccount) {
      Logger.warn(`Account with Ally Code ${data.allyCode} already exists.`);
      throw new Error(`Account with Ally Code ${data.allyCode} already exists.`);
    }

    return this.create({
      allyCode: data.allyCode,
      displayName: data.name,
      playerId: data.playerId,
      discordId,
      memberId: `${serverId}-${discordId}`,
      alt: false,
    });
  }

  /**
   * Create a new account for a DiscordUser.
   * @param discordId - The DiscordUser's unique identifier
   * @param data - The account creation data
   */
  async createAltAccount(discordId: string, serverId: string, data: PlayerData): Promise<Account> {
    Logger.info(`Attempting to create account for Discord ID: ${discordId} with Ally Code: ${data.allyCode}`);
    const existingAccount = await this.findByAllyCode(data.allyCode);

    if (existingAccount) {
      Logger.warn(`Account with Ally Code ${data.allyCode} already exists.`);
      throw new Error(`Account with Ally Code ${data.allyCode} already exists.`);
    }

    return this.create({
      allyCode: data.allyCode,
      displayName: data.name,
      playerId: data.playerId,
      discordId,
      memberId: `${serverId}-${discordId}`,
      alt: true,
    });
  }

  /**
   * Find all accounts associated with a DiscordUser.
   * @param discordId - The DiscordUser's unique identifier
   * @param options - Sequelize find options
   */
  async findAllUserAccounts(discordId: string, options?: FindOptions): Promise<Account[]> {
    Logger.info(`Fetching all accounts for Discord ID: ${discordId}`);
    return this.findAll({ where: { discordId }, ...options });
  }

  /**
   * Find an account by its Ally Code.
   * @param allyCode - The Ally Code unique identifier
   * @param options - Sequelize find options
   */
  async findByAllyCode(allyCode: string, options?: FindOptions): Promise<Account | null> {
    Logger.info(`Fetching account with Ally Code: ${allyCode}`);
    return this.findOneByCriteria(
      { allyCode },
      {
        include: [
          {
            model: Member,
            as: 'member',
            include: [
              {
                model: Server,
                as: 'server',
              },
              {
                model: DiscordUser,
                as: 'user',
              },
            ],
          },
          {
            model: Strikes,
            as: 'strikes',
          },
        ],
        ...options,
      },
    );
  }

  /**
   * Find all accounts for a specific server.
   * @param serverId - The server's unique identifier
   * @param options - Sequelize find options
   */
  async findAllByServer(serverId: string, options?: FindOptions): Promise<Account[]> {
    Logger.info(`Fetching all accounts for Server ID: ${serverId}`);
    try {
      // Fetch all members associated with the server
      const members = await new MemberRepository().findAllServerMembers(serverId, {
        ...options,
        include: [{ model: Account, as: 'accounts' }],
      });

      Logger.info(`Found ${members.length} members for Server ID: ${serverId}. Collecting accounts...`);

      const accounts: Account[] = [];

      for (const member of members) {
        Logger.info(`Processing member with Discord ID: ${member.discordId}`);
        if (!member.accounts) {
          Logger.warn(`No accounts found for member with Discord ID: ${member.discordId}`);
          continue;
        }
        Logger.info(`Found ${member.accounts.length} accounts for member with Discord ID: ${member.discordId}`);
        for (const account of member.accounts) {
          Logger.info(`Retrieving account with allyCode: ${account.allyCode}`);
          const accountData = await this.findByAllyCode(account.allyCode, options);
          if (accountData) {
            Logger.info(`Account with Ally Code: ${account.allyCode} found.`);
            accounts.push(accountData);
          } else {
            Logger.warn(`Account with Ally Code: ${account.allyCode} not found.`);
          }
        }
      }

      Logger.info(`Collected ${accounts.length} accounts for Server ID: ${serverId}`);
      return accounts;
    } catch (error) {
      Logger.error(`Error fetching accounts for Server ID: ${serverId}`, { error });
      throw error;
    }
  }
}
