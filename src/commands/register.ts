import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildUserTable } from '../utils/database/models/guild-db';

export default {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Registers member with bot')
    .addUserOption((option) =>
      option.setName('user').setDescription('User you want to add strikes too').setRequired(true),
    ),

  async execute(interaction: any) {
    const user = interaction.options.getUser('user');
    const serverId = interaction.guild.id;
    const duplicate = await GuildUserTable.findOne({
      where: { Name: user.username, UniqueId: user.id, ServerId: serverId },
    });
    try {
      if (duplicate) {
        await interaction.reply('User is already registered');
      }

      await GuildUserTable.create({
        Name: user.username,
        Strikes: 0,
        TotalStrikes: 0,
        UniqueId: user.id,
        ServerId: serverId,
      });

      return interaction.reply(`${user.username} has been successfully registered with the bot`);
    } catch (error) {
      console.log(error);
    }
  },
};
