import { APIEmbed, ApplicationCommandOptionType } from 'discord.js';
import { Logger } from '../../logger';
import { strikeChoicesAutocomplete } from '../../utils/helpers/commandVariables';
import { addStrike } from '../../methods/add-strike';
import { Command } from '../../classes/Commands';
import { ServerTableService } from '../../database/services/server-services';
import { checkStrikes } from '../../methods/check-strike';
import { removeStrikeFromMember } from '../../methods/remove-strikes';
import { getStrikeValues } from '../../methods/get-strikes-values';
import { setStrikeValues } from '../../methods/set-strike-values';

export default new Command({
  name: 'strikes',
  description: 'Strike super command',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      name: 'add',
      description: 'add strike(s) to player',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: 'user1',
          description: 'First User',
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'reason1',
          description: "First User's Strike Reason",
          required: true,
          autocomplete: true,
        },
        {
          type: ApplicationCommandOptionType.User,
          name: 'user2',
          description: 'Second User',
          required: false,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'reason2',
          description: "Second User's Strike Reason",
          required: false,
          autocomplete: true,
        },
        {
          type: ApplicationCommandOptionType.User,
          name: 'user3',
          description: 'Third User',
          required: false,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'reason3',
          description: "Third User's Strike Reason",
          required: false,
          autocomplete: true,
        },
        {
          type: ApplicationCommandOptionType.User,
          name: 'user4',
          description: 'Fourth User',
          required: false,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'reason4',
          description: "Fourth User's Strike Reason",
          required: false,
          autocomplete: true,
        },
        {
          type: ApplicationCommandOptionType.User,
          name: 'user5',
          description: 'Fifth User',
          required: false,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'reason5',
          description: "Fifth User's Strike Reason",
          required: false,
          autocomplete: true,
        },
      ],
    },
    {
      name: 'remove',
      description: 'removes strike(s) from player',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'user',
          description: 'Member you want to remove strikes from',
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: 'strike',
          description: 'The 1st strike you want to remove from the member',
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
        {
          name: 'reason',
          description: 'Reason for removing the 1st strike (optional)',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: 'check',
      description: 'show a players strike(s) for the current month',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        ...Array.from({ length: 10 }, (_, i) => ({
          name: `user${i + 1}`,
          description: 'The user that you would like to see the strikes for.',
          type: 6,
          required: false,
        })),
      ],
    },

    {
      name: 'get',
      description: 'get strike details',
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: 'values',
          description: 'show guilds pre-set strike values',
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
    {
      name: 'set',
      description: 'set strike details',
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: 'value',
          description: 'sets guilds strike values',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: 'strike',
              description: 'The Strike you wish to change the value of.',
              required: true,
              autocomplete: true,
            },
            {
              type: ApplicationCommandOptionType.Integer,
              name: 'value',
              description: 'The value that will be assigned whenever a member receives this strike.',
              required: true,
            },
          ],
        },
      ],
    },
  ],
  autocomplete: async ({ interaction }) => {
    await strikeChoicesAutocomplete(interaction);
  },
  execute: async ({ interaction }) => {
    try {
      let response: string;
      let title: string;
      Logger.info(`Strike ${interaction.options.getSubcommand()} executed`);

      if (!interaction.guildId) {
        throw new Error();
      }

      const server = await ServerTableService.getServerTableByServerId(interaction.guildId);

      if (!server) {
        return {};
      }

      if (!interaction.options.getSubcommandGroup()) {
        if (interaction.options.getSubcommand() === 'add') {
          title = 'Strikes Added';
          response = await addStrike(interaction, server);
        }
        if (interaction.options.getSubcommand() === 'check') {
          title = 'Strikes';
          response = await checkStrikes(interaction, server);
        }
        if (interaction.options.getSubcommand() === 'remove') {
          title = 'Removed Strikes';
          response = await removeStrikeFromMember(interaction, server);
        }
      } else {
        if (interaction.options.getSubcommandGroup() === 'get') {
          title = 'Strike Values';
          response = await getStrikeValues(interaction, server);
        }
        if (interaction.options.getSubcommandGroup() === 'set') {
          title = 'Strike Values';
          response = await setStrikeValues(interaction, server);
        }
      }

      const result: APIEmbed = { title, fields: [{ name: '', value: response }] };

      return result;
    } catch (error) {
      Logger.error(error);
      await interaction.reply({
        content: 'Something went wrong.',
        ephemeral: true,
      });
    }
  },
});

