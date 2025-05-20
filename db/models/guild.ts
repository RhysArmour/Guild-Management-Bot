import { Model, DataTypes, Association, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../index';
import { Server } from './server';

export class Guild extends Model<InferAttributes<Guild>, InferCreationAttributes<Guild>> {
  public guildId!: string;
  public guildName!: string;
  public guildResetTime!: Date;
  public galacticPower!: number;
  public serverId!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // associations
  public readonly server?: Server;

  public static associations: {
    server: Association<Guild, Server>;
  };
}

Guild.init(
  {
    guildId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      field: 'guild_id',
    },
    guildName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'guild_name',
    },
    guildResetTime: {
      type: DataTypes.DATE,
      defaultValue: 0,
      field: 'guild_reset_time',
    },
    galacticPower: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'galactic_power',
      get() {
        const rawValue = this.getDataValue('galacticPower'); // Get the stored value
        return rawValue.toLocaleString('en-US');
      },
    },
    serverId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'server_id',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'guild',
    timestamps: true,
  },
);
