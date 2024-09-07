import { APIEmbed, ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { GuildSetup } from '../../methods/bot-setup';
import { ServerWithRelations } from '../../interfaces/database/server-table-interface';

export default new Command({
  name: 'setupserver',
  description: 'Sets the role you desire to be used as your "away" role for strikes to be forgiven',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      name: 'allycode',
      description: 'Role which is used to show the guild role',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'autoticketstrikes',
      description: 'Would you like automatic ticket strikes to be enabled?',
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
    // {
    //   name: 'strikeresetperiod',
    //   description: 'Role which is used to show a player will be absent',
    //   type: ApplicationCommandOptionType.Integer,
    //   choices: [
    //     {
    //       name: '1 month',
    //       value: 1,
    //     },
    //     {
    //       name: '2 month',
    //       value: 2,
    //     },
    //     {
    //       name: '3 month',
    //       value: 3,
    //     },
    //     {
    //       name: '4 month',
    //       value: 4,
    //     },
    //     {
    //       name: '5 month',
    //       value: 5,
    //     },
    //     {
    //       name: '6 month',
    //       value: 6,
    //     },
    //   ],
    //   required: false,
    // },
  ],

  execute: async ({ interaction }, server: ServerWithRelations) => {
    try {
      Logger.info(`Bot Setup Server command executed for server: ${interaction.guildId}`);

      Logger.info('Retrieving Guild Data from Interaction.');

      const serverData = extractServerData(interaction);

      Logger.info('Data Successfully Retrieved');

      await GuildSetup.setupGuildServer(interaction, serverData, server);

      Logger.info('Guild data setup completed');

      const result: APIEmbed = {
        title: 'Setup Server',
        fields: [{ name: 'Message', value: 'Server data set successfully' }],
      };

      return result;
    } catch (error) {
      Logger.error(`An error occurred in the Bot Setup command: ${error}`);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occured whilst setting up the bot. Please try again later.' }],
      };
    }
  },
});

function extractServerData(interaction: ChatInputCommandInteraction) {
  return {
    ticketStrikesEnabled: interaction.options.getBoolean('autoticketstrikes'),
    allyCode: interaction.options.getString('allycode'),
  };
}
