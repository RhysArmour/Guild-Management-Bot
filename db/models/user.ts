import { Model, DataTypes, Association, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../index';
import { Member } from './member';
import { Strikes } from './strikes';
import { Account } from './account';

export class DiscordUser extends Model<InferAttributes<DiscordUser>, InferCreationAttributes<DiscordUser>> {
  public discordId!: string;
  public displayName!: string;
  public userName!: string;
  public activeStrikeCount!: number;
  public totalLifetimeStrikes!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // associations
  public readonly members?: Member[];
  public readonly accounts?: Account[];
  public readonly strikes?: Strikes[];

  public static associations: {
    members: Association<DiscordUser, Member>;
    accounts: Association<DiscordUser, Account>;
    strikes: Association<DiscordUser, Strikes>;
  };
}

DiscordUser.init(
  {
    discordId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      field: 'discord_id',
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'display_name',
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'user_name',
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'discordUser',
    timestamps: true,
  },
);
