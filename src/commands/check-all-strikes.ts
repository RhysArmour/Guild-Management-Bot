import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildUserTable } from '../utils/database/models/guild-db';

export default {
  data: new SlashCommandBuilder()
    .setName('checkallstrikes')
    .setDescription('Check strikes for all members'),

  async execute(interaction: any) {
    const serverId = interaction.guild.id;
    const guildSearch = await GuildUserTable.findAll({ where: { ServerId: serverId } });

    let reply = 'Here is the list of guild strikes:';
    guildSearch.forEach((member: any) => {
      reply += `\n\n${member.Name}: \nstrikes: ${member.Strikes} \nlifetime strikes: ${member.TotalStrikes}`;
    });
    await interaction.reply(reply);
  },
};
