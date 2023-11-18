import { ApplicationCommandOptionType } from 'discord.js';
import { Logger } from '../../logger';
import { autocompleteChoices } from '../../utils/commandVariables';
import { addStrike } from '../../methods/add-strike';
import { Command } from '../../classes/Commands';

export default new Command({
  name: 'addstrikes',
  description: 'Adds strikes for one or multiple members',
  defaultMemberPermissions: 'KickMembers',
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
    // Add more user and reason options as needed
  ],
  autocomplete: async ({ interaction }) => {
    const focusedOption = interaction.options.getFocused(true);
    console.log(focusedOption);
    let choices;
    if (focusedOption.value.includes('')) {
      choices = autocompleteChoices.slice(0, 25);
    } else if (focusedOption.value.includes('TW')) {
      choices = autocompleteChoices.filter((choice) => choice.startsWith('TW'));
    } else if (focusedOption.value.includes('RAID')) {
      choices = autocompleteChoices.filter((choice) => choice.startsWith('RAID'));
    } else if (focusedOption.value.includes('TB')) {
      choices = autocompleteChoices.filter((choice) => choice.startsWith('TB'));
    }

    console.log(choices);

    const filtered = choices.filter((choice) => choice.startsWith(focusedOption.value));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
  },
  execute: async ({ interaction }) => {
    try {
      Logger.info('Add Strikes command executed');
      // if (interaction.options._hoistedOptions.length % 2 !== 0) {
      //   return {
      //     message: 'You must select a user and the reason for the strike.',
      //     content: undefined,
      //   };
      // }

      const strikes = await addStrike(interaction);

      Logger.info('Strikes Added');

      return strikes;
    } catch (error) {
      Logger.error(error);
      await interaction.reply({
        content: 'Something went wrong.',
        ephemeral: true,
      });
    }
  },
});
