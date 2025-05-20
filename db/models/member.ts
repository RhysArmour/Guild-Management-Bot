import { Model, DataTypes, Association, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../index';
import { Strikes } from './strikes';
import { Account } from './account';
import { DiscordUser } from './user';
import { Server } from './server';

export class Member extends Model<InferAttributes<Member>, InferCreationAttributes<Member>> {
  public memberId!: string;
  public discordId!: string;
  public serverId!: string;
  public displayName!: string;
  public activeStrikeCount!: number;
  public totalLifetimeStrikes!: number;
  public absent!: boolean;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // associations
  public readonly strikes?: Strikes[];
  public readonly accounts?: Account[];
  public readonly user?: DiscordUser;
  public readonly server?: Server;

  public static associations: {
    strikes: Association<Member, Strikes>;
    accounts: Association<Member, Account>;
    user: Association<Member, DiscordUser>;
    server: Association<Member, Server>;
  };
}

Member.init(
  {
    memberId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      field: 'member_id',
    },
    discordId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'discord_id',
    },
    serverId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'server_id',
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'display_name',
    },
    activeStrikeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_strike_count',
    },
    totalLifetimeStrikes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_lifetime_strikes',
    },
    absent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'absent',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'member',
    timestamps: true,
  },
);

