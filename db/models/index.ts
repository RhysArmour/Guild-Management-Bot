import { Account } from './account';
import { Channels } from './channels';
import { Guild } from './guild';
import { Member } from './member';
import { Roles } from './roles';
import { Server } from './server';
import { Strikes } from './strikes';
import { DiscordUser } from './user';

// Define associations
DiscordUser.hasMany(Member, { foreignKey: 'discord_id', as: 'members' });
Member.belongsTo(DiscordUser, { foreignKey: 'discord_id', as: 'user' });

DiscordUser.hasMany(Account, { foreignKey: 'discord_id', as: 'accounts' });
Account.belongsTo(DiscordUser, { foreignKey: 'discord_id', as: 'user' });

DiscordUser.hasMany(Strikes, { foreignKey: 'discord_id', as: 'strikes' });
Strikes.belongsTo(DiscordUser, { foreignKey: 'discord_id', as: 'user' });

Member.hasMany(Account, { foreignKey: 'member_id', as: 'accounts' });
Account.belongsTo(Member, { foreignKey: 'member_id', as: 'member' }); // Ensure this is defined after Member is imported

Member.hasMany(Strikes, { foreignKey: 'member_id', as: 'strikes' });
Strikes.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

Member.belongsTo(Server, { foreignKey: 'server_id', as: 'server' });
Server.hasMany(Member, { foreignKey: 'server_id', as: 'members' });

Server.hasMany(Strikes, { foreignKey: 'server_id', as: 'strikes' });
Strikes.belongsTo(Server, { foreignKey: 'server_id', as: 'server' });

Server.hasOne(Channels, { foreignKey: 'server_id', as: 'channels' });
Channels.belongsTo(Server, { foreignKey: 'server_id', as: 'server' });

Server.hasOne(Roles, { foreignKey: 'server_id', as: 'roles' });
Roles.belongsTo(Server, { foreignKey: 'server_id', as: 'server' });

Server.hasOne(Guild, { foreignKey: 'server_id', as: 'guild' });
Guild.belongsTo(Server, { foreignKey: 'server_id', as: 'server' });

Account.hasMany(Strikes, { foreignKey: 'ally_code', as: 'strikes' });
Strikes.belongsTo(Account, { foreignKey: 'ally_code', as: 'account' });

export { Account, Channels, Guild, Member, Roles, Server, Strikes, DiscordUser };
