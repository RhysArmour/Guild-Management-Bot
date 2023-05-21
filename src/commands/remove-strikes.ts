import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord.js';
import { GuildUserTable } from '../utils/database/models/guild-db';

export default {
  data: new SlashCommandBuilder()
    .setName('removestrikes')
    .setDescription('Clear desired number of strikes from player')
    .addUserOption((option) => option.setName('user').setDescription('User you want to clear strikes from'))
    .addIntegerOption((option) => option.setName('amount').setDescription('amount of strikes you want to clear'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction: any) {
    const user = interaction.options.getUser('user');
    const serverId = interaction.guild.id;
    const integer = interaction.options.getInteger('amount');

    try {
      if (user && integer) {
        const result = await GuildUserTable.findOne({
          where: { Name: user.username, UniqueId: user.id, ServerId: serverId },
        });

        if (result === null) {
          return interaction.reply(
            'Player is not registered with Bot. This is because they have not attained any strikes or have not been registered manually',
          );
        }

        if (result.strikes === 0) {
          await interaction.reply(`Cannot remove ${integer} from ${user.username} because they have zero strikes`);
          return;
        }

        const strikes = result.strikes - integer;

        if (strikes < 0) {
          await interaction.reply(
            `Cannot remove more strikes than a member has. Current strikes for ${user.username} is ${result.strikes} therefore you can only remove a maximum of ${result.strikes}`,
          );
          return;
        }

        await GuildUserTable.update(
          { Strikes: strikes },
          {
            where: {
              Name: user.username,
              UniqueId: user.id,
              ServerId: serverId,
            },
          },
        );

        await interaction.reply(`${integer} strike(s) have been removed from ${user.username}`);
        return;
      }

      await interaction.reply(
        'Please provide a valid input. If you want all strikes removed, only select "all". if you would like an individual\'s strikes removed, please use "user" followed by "amount", like so:\n\n /clearstrikes user: {user} amount: {amount}\n or\n /clearstrikes all: true',
      );
    } catch (error) {
      console.log(error);
      await interaction.reply(
        'Please provide a valid input. If you want all strikes removed, only select "all". if you would like an individual\'s strikes removed, please use "user" followed by "amount", like so:\n\n /clearstrikes user: {user} amount: {amount}\n or\n /clearstrikes all: true',
      );
    }
  },
};
