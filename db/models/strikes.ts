import { Model, DataTypes, Association, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../index';
import { DiscordUser } from './user';
import { Member } from './member';
import { Account } from './account';
import { Server } from './server';
import { DiscordUserRepository } from '../../src/database/repositories/user-repository';
import { MemberRepository } from '../../src/database/repositories/member-repository';
import { AccountRepository } from '../../src/database/repositories/account-repository';
import { Logger } from '../../src/logger';

export class Strikes extends Model<InferAttributes<Strikes>, InferCreationAttributes<Strikes>> {
  public id!: number;
  public serverId!: string;
  public memberId!: string;
  public allyCode!: string;
  public active: boolean;
  public reason!: string;
  public assignedDate!: Date;
  public type!: string;
  public discordId!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // associations
  public readonly user?: DiscordUser;
  public readonly member?: Member;
  public readonly account?: Account;
  public readonly server?: Server;

  public static associations: {
    user: Association<Strikes, DiscordUser>;
    member: Association<Strikes, Member>;
    account: Association<Strikes, Account>;
    server: Association<Strikes, Server>;
  };
}

Strikes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    serverId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'server_id',
    },
    memberId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'member_id',
    },
    allyCode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ally_code',
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'active',
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'reason',
    },
    assignedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'assigned_date',
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'strike', // Can be 'strike', 'warning', etc.
      field: 'type',
    },
    discordId: {
      // Define discordId here
      type: DataTypes.STRING,
      allowNull: false,
      field: 'discord_id',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'strikes',
    timestamps: true,
  },
);

// After create hook to update strike counts
Strikes.afterCreate('After Strike Creation', async (instance: Strikes) => {
  Logger.info(`AfterCreate Hook Triggered for Strike ID: ${instance.id}`);
  try {
    const user = await new DiscordUserRepository().findById(instance.discordId, {
      include: [{ model: Strikes, as: 'strikes' }],
    });
    const member = await new MemberRepository().findById(instance.memberId, {
      include: [{ model: Strikes, as: 'strikes' }],
    });
    const account = await new AccountRepository().findOneByCriteria(
      { allyCode: instance.allyCode },
      { include: [{ model: Strikes, as: 'strikes' }] },
    );

    Logger.info(
      `Updating strike counts for User: ${user?.discordId}, Member: ${member?.memberId}, Account: ${account?.allyCode}`,
    );

    await user.update({
      activeStrikeCount: user.strikes.filter((strike) => strike.active).length,
      totalLifetimeStrikes: user.strikes.length,
    });

    await member.update({
      activeStrikeCount: member.strikes.filter((strike) => strike.active).length,
      totalLifetimeStrikes: member.strikes.length,
    });

    await account.update({
      activeStrikeCount: account.strikes.filter((strike) => strike.active).length,
      totalLifetimeStrikes: account.strikes.length,
    });

    await user.save();
    await member.save();
    await account.save();

    Logger.info(`Strike counts updated successfully for Strike ID: ${instance.id}`);
  } catch (error) {
    Logger.error(`Error in AfterCreate Hook for Strike ID: ${instance.id} - ${error.message}`);
  }
});

// After destroy hook to update strike counts
Strikes.afterDestroy('After Strike Destroy', async (instance: Strikes) => {
  Logger.info(`AfterDestroy Hook Triggered for Strike ID: ${instance.id}`);
  try {
    const user = await new DiscordUserRepository().findById(instance.discordId, {
      include: [{ model: Strikes, as: 'strikes' }],
    });
    const member = await new MemberRepository().findById(instance.memberId, {
      include: [{ model: Strikes, as: 'strikes' }],
    });
    const account = await new AccountRepository().findOneByCriteria(
      { allyCode: instance.allyCode },
      { include: [{ model: Strikes, as: 'strikes' }] },
    );

    Logger.info(
      `Updating strike counts for User: ${user?.discordId}, Member: ${member?.memberId}, Account: ${account?.allyCode}`,
    );

    const activeUserStrikes = await Strikes.findAll({
      where: {
        discordId: instance.discordId,
        active: true,
      },
    });
    const activeMemberStrikes = await Strikes.findAll({
      where: {
        memberId: instance.memberId,
        active: true,
      },
    });
    const activeAccountStrikes = await Strikes.findAll({
      where: {
        allyCode: instance.allyCode,
        active: true,
      },
    });

    await user.update({
      activeStrikeCount: activeUserStrikes.length,
      totalLifetimeStrikes: user.strikes.length,
    });

    await member.update({
      activeStrikeCount: activeMemberStrikes.length,
      totalLifetimeStrikes: member.strikes.length,
    });

    await account.update({
      activeStrikeCount: activeAccountStrikes.length,
      totalLifetimeStrikes: account.strikes.length,
    });

    await user.save();
    await member.save();
    await account.save();

    Logger.info(`Strike counts updated successfully for Strike ID: ${instance.id}`);
  } catch (error) {
    Logger.error(`Error in AfterDestroy Hook for Strike ID: ${instance.id} - ${error.message}`);
  }
});
