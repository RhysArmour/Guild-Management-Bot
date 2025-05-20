import { Model, DataTypes, Association, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../index';
import { Server } from './server';

export class Roles extends Model<InferAttributes<Roles>, InferCreationAttributes<Roles>> {
  public id!: number;
  public serverId!: string;
  public guildRoleId: string;
  public guildRoleName: string;
  public absenceRoleId: string;
  public absenceRoleName: string;
  public strikeLimitRoleId: string;
  public strikeLimitRoleName: string;
  public OfficerRoleId: string;
  public OfficerRoleName: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // associations
  public readonly server?: Server;

  public static associations: {
    server: Association<Roles, Server>;
  };
}

Roles.init(
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
    guildRoleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      field: 'guild_role_id',
    },
    guildRoleName: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      field: 'guild_role_name',
    },
    absenceRoleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      field: 'absence_role_id',
    },
    absenceRoleName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'absence_role_name',
    },
    strikeLimitRoleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      field: 'strike_limit_role_id',
    },
    strikeLimitRoleName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'strike_limit_role_name',
    },
    OfficerRoleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      field: 'officer_role_id',
    },
    OfficerRoleName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'officer_role_name',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'roles',
    timestamps: true,
  },
);
