import { Model, DataTypes, Association, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../index';
import { Strikes } from './strikes';
import { DiscordUser } from './user';
import { Member } from './member';

export class Account extends Model<InferAttributes<Account>, InferCreationAttributes<Account>> {
  public allyCode!: string;
  public playerId!: string;
  public displayName!: string;
  public activeStrikeCount!: number;
  public totalLifetimeStrikes!: number;
  public alt!: boolean;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // foreign keys
  public readonly discordId!: string;
  public readonly memberId!: string;

  // associations
  public readonly strikes?: Strikes[];
  public readonly user?: DiscordUser;
  public readonly member?: Member;

  public static associations: {
    strikes: Association<Account, Strikes>;
    user: Association<Account, DiscordUser>;
    member: Association<Account, Member>;
  };
}

Account.init(
  {
    allyCode: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      field: 'ally_code',
    },
    playerId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'player_id',
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'display_name',
    },
    activeStrikeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'strike_count',
    },
    totalLifetimeStrikes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'lifetime_strikes',
    },
    discordId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'discord_id',
    },
    memberId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'member_id',
    },
    alt: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'alt',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'accounts',
    timestamps: true,
  },
);
