import { Model, DataTypes, Association, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../index';
import { Server } from './server';

export class Channels extends Model<InferAttributes<Channels>, InferCreationAttributes<Channels>> {
  public serverId!: string;
  public strikeChannelName: string;
  public strikeChannelId: string;
  public strikeLimitChannelName: string;
  public strikeLimitChannelId: string;
  public notificationChannelName: string;
  public notificationChannelId: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // associations
  public readonly server?: Server;

  public static associations: {
    server: Association<Channels, Server>;
  };
}

Channels.init(
  {
    serverId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      field: 'server_id',
    },
    strikeChannelName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'strike_channel_name',
    },
    strikeChannelId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      field: 'strike_channel_id',
    },
    strikeLimitChannelName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'strike_limit_channel_name',
    },
    strikeLimitChannelId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      field: 'strike_limit_channel_id',
    },
    notificationChannelName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'notification_channel_name',
    },
    notificationChannelId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      field: 'notification_channel_id',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'channels',
    timestamps: true,
  },
);
