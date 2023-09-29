import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits, ApplicationCommandOptionType, InteractionType } from 'discord.js';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { setupGuildData } from '../../methods/bot-setup';

export default new Command({
  name: 'botsetup',
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
    {
      name: 'guildrole',
      description: "Role which is used to show the guild's role",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: 'absencerole',
      description: 'Role which is used to show a player will be absent',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: 'strikelimitrole',
      description: 'Role which is given when a member hits the guild strike limit',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: 'ticketlimit',
      description: 'The limit of tickets a player must produce before being given a strike',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: 'strikelimit',
      description: 'The limit of strikes a player can receive before being given the strike limit role',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: 'triggerphrase',
      description: 'Phrase which will trigger ticket strikes',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  execute: async ({ interaction }) => {
    try {
      Logger.info('Bot Setup command executed');

      if (interaction.type !== InteractionType.ApplicationCommand || !interaction.isChatInputCommand()) {
        Logger.info('Interaction is not an Application Command');
        return undefined;
      }

      Logger.info('Retrieving Guild Data from Interaction.');

      const offenseChannel = interaction.options.getChannel('ticketchannel');
      const strikeChannel = interaction.options.getChannel('strikechannel');
      const strikeLimitChannel = interaction.options.getChannel('strikelimitchannel');
      const awayRole = interaction.options.getRole('absencerole');
      const guildRole = interaction.options.getRole('guildrole');
      const strikeLimitRole = interaction.options.getRole('strikelimitrole');
      const ticketLimit = interaction.options.getInteger('ticketlimit');
      const strikeLimit = interaction.options.getInteger('strikelimit');
      const triggerPhrase = interaction.options.getString('triggerphrase');

      console.log('triggerPhrase', triggerPhrase);

      const serverData = {
        offenseChannel,
        strikeChannel,
        strikeLimitChannel,
        awayRole,
        guildRole,
        strikeLimitRole,
        ticketLimit,
        strikeLimit,
        triggerPhrase,
      };

      console.log('serverData', serverData);

      Logger.info('Data Successfully Retrieved');

      const setupData = await setupGuildData(interaction, serverData);

      Logger.info('Guild data setup completed');

      return setupData;
    } catch (error) {
      Logger.error(`An error occurred in the Bot Setup command: ${error}`);
      return 'An error occurred while setting up guild data. Please try again later.';
    }
  },
});
