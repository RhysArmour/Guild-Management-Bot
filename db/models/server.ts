import { Model, DataTypes, Association, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../index';
import { Channels } from './channels';
import { Roles } from './roles';
import { Member } from './member';
import { Strikes } from './strikes';
import { Guild } from './guild';

export class Server extends Model<InferAttributes<Server>, InferCreationAttributes<Server>> {
  public serverId!: string;
  public serverName!: string;
  public strikeResetPeriod!: string | null;
  public lastStrikeReset!: Date | null;
  public strikeCountMethod!: string;
  public strikeLimit!: number;
  public ticketLimit!: number;
  public ticketStrikesActive: boolean;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // associations
  public readonly channels?: Channels;
  public readonly roles?: Roles;
  public readonly members?: Member[];
  public readonly strikes?: Strikes[];
  public readonly guild?: Guild;

  public static associations: {
    channels: Association<Server, Channels>;
    roles: Association<Server, Roles>;
    members: Association<Server, Member>;
    strikes: Association<Server, Strikes>;
    guild: Association<Server, Guild>;
  };
}

Server.init(
  {
    serverId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      field: 'server_id',
    },
    serverName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'server_name',
    },
    strikeResetPeriod: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'P1M',
      field: 'strike_reset_period',
      get() {
        const rawValue = this.getDataValue('strikeResetPeriod'); // Get the stored value
        if (!rawValue) return null;

        // Convert ISO 8601 duration (e.g., P1W, P2M) to readable format
        const durationMap: { [key: string]: string } = {
          D: 'Day',
          W: 'Week',
          M: 'Month',
          Y: 'Year',
        };

        const match = rawValue.match(/P(\d+)([DWMY])/); // Match the pattern (e.g., P1W, P2M)
        if (match) {
          const [, value, unit] = match;
          const unitReadable = durationMap[unit] || unit;
          return `${value} ${unitReadable}${value === '1' ? '' : 's'}`; // Add 's' for plural units
        }

        return rawValue; // Return raw value if it doesn't match the pattern
      },
    },
    lastStrikeReset: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
      field: 'last_strike_reset',
    },
    strikeCountMethod: {
      type: DataTypes.STRING,
      defaultValue: 'member', // either 'member' or 'account'
      field: 'strike_count_method',
    },
    strikeLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      field: 'strike_limit',
    },
    ticketLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 600,
      field: 'ticket_limit',
    },
    ticketStrikesActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'ticket_strikes_active',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'server',
    timestamps: true,
  },
);
