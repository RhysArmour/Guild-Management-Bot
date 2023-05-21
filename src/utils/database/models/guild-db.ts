import { Table, Column, Model, HasMany } from 'sequelize-typescript';
import { DiscordUser } from '../../../interfaces/discord/discordUser';
import { GuildBotData } from './bot-db';

@Table
export class GuildUserTable extends Model {
  @Column
  uniqueUserId: string;

  @Column
  userName: string;

  @Column
  serverId: string;

  @Column
  serverName: string;

  @Column
  createDate: string;

  @Column
  updatedDate: string;

  @Column
  strikes: number;

  @Column
  lifetimeStrikes: string;

  @Column
  abscent: string;

  @Column
  currentAbsenceStartDate: string;

  @Column
  previousAbsenceDuration: string;
}

export const checkRoomsAreAssigned = async (serverId: string) => {
  const record = await GuildBotData.findOne({
    where: { Name: 'Strike Channel', ServerId: serverId },
  });
  if (!record) {
    const reply = 'You must set Offense Channel and Strike Channel before issuing strikes.';
    return reply;
  }
  return true;
};

export const updateStrike = async (user: DiscordUser, serverId: string) => {
  await GuildUserTable.increment('Strikes', {
    by: 1,
    where: { Name: user.username, UniqueId: user.id, ServerId: serverId },
  });
  await GuildUserTable.increment('TotalStrikes', {
    by: 1,
    where: { Name: user.username, UniqueId: user.id, ServerId: serverId },
  });
  return GuildUserTable.findOne({ where: { Name: user.username, UniqueId: user.id, ServerId: serverId } });
};

export const assignStrikes = async (user: DiscordUser, serverId: string) => {
  const duplicate = await GuildUserTable.findOne({
    where: { Name: user.username, UniqueId: user.id, ServerId: serverId },
  });
  if (!duplicate) {
    console.log('CREATING ENTRY');
    return GuildUserTable.create({
      Name: user.username,
      Strikes: 1,
      TotalStrikes: 1,
      UniqueId: user.id,
      ServerId: serverId,
    });
  }
  return updateStrike(user, serverId);
};

export const getStrikes = async (user: DiscordUser, serverId: string) => {
  const record = await GuildUserTable.findOne({
    where: { Name: user.username, UniqueId: user.id, ServerId: serverId },
  });
  const strikes = record.strikes;
  return strikes;
};
