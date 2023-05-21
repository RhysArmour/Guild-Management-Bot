import { Table, Column, Model } from 'sequelize-typescript';

@Table
export class GuildBotData extends Model {
  @Column
  serverName: string;

  @Column
  serverId: string;

  @Column
  createdDate: string;

  @Column
  updatedDate: string;

  @Column
  guildRoleIdName: string;

  @Column
  guildRoleId: string;

  @Column
  absentRoleIdName: string;

  @Column
  absentRoleId: string;

  @Column
  strikeLimit: string;

  @Column
  ticketLimit: string;

  @Column
  ticketChannelName: string;

  @Column
  ticketChannelId: string;

  @Column
  strikeChannelName: string;

  @Column
  strikeChannelId: string;

  @Column
  strikeLimitRoleName: string;

  @Column
  strikeLimitRoleId: string;

  @Column
  strikeLimitChannelName: string;

  @Column
  strikeLimitChannelId: string;

  @Column
  strikeResetPeriod: string;

  @Column
  lastStrikeReset: string;

  @Column
  triggerPhrase: string;
}


export const getAwayRole = async (serverId: string) => {
  const awayRole = await GuildBotData.findOne({
    where: { Name: 'Away Role', ServerId: serverId },
  });
  return awayRole;
};