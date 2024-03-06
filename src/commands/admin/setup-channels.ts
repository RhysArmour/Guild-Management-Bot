import { ApplicationCommandOptionType, TextChannel } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { GuildSetup } from '../../methods/bot-setup';
import { ServerWithRelations } from '../../interfaces/database/server-table-interface';

export default new Command({
  name: 'setupchannels',
  description: 'Sets the role you desire to be used as your "away" role for strikes to be forgiven',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      name: 'ticketchannel',
      description: 'Channel which is used to post ticket offenses',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: 'strikechannel',
      description: 'Channel which is used to post all strikes',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: 'strikelimitchannel',
      description: 'Channel which is for members who hit strike limit',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  execute: async ({ interaction }, server: ServerWithRelations) => {
    try {
      Logger.info(`Bot Setup command executed for server: ${server.serverId}`);

      const [ticketChannel, strikeChannel, strikeLimitChannel] = retrieveChannelOptions(interaction);

      const serverData = { ticketChannel, strikeChannel, strikeLimitChannel };

      Logger.info('Data Successfully Retrieved');

      await GuildSetup.setupGuildChannels(interaction, serverData);

      Logger.info('Guild data setup completed');

      const result = {
        title: 'Setup Channels',
        fields: [{ name: 'Message', value: 'Server Channels set successfully' }],
      };

      return result
    } catch (error) {
      Logger.error(`An error occurred in the Bot Setup command: ${error}`);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occured whilst setting up the bot. Please try again later.' }],
      };
    }
  },
});

function retrieveChannelOptions(interaction) {
  return [
    interaction.options.getChannel('ticketchannel') as TextChannel,
    interaction.options.getChannel('strikechannel') as TextChannel,
    interaction.options.getChannel('strikelimitchannel') as TextChannel,
  ];
}
