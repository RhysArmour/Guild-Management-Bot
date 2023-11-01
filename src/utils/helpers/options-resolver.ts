import {
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOption,
  Role,
  TextChannel,
  User,
} from 'discord.js';

// Define the function to extract option values
export function extractOptionValues(interaction: CommandInteraction): Record<string, unknown> {
  const options: Record<string, unknown> = {};

  // Check if the interaction has options
  if (interaction.options) {
    // Loop through each option
    interaction.options.data.forEach((option: CommandInteractionOption) => {
      // Check option type and set its value in the options object
      switch (option.type) {
        case ApplicationCommandOptionType.String:
          options[option.name] = option.value as string;
          break;
        case ApplicationCommandOptionType.Integer:
          options[option.name] = option.value as number;
          break;
        case ApplicationCommandOptionType.Boolean:
          options[option.name] = option.value as boolean;
          break;
        case ApplicationCommandOptionType.User:
          options[option.name] = option.user as User;
          break;
        case ApplicationCommandOptionType.Channel:
          options[option.name] = option.channel as TextChannel;
          break;
        case ApplicationCommandOptionType.Role:
          options[option.name] = option.role as Role;
          break;
        // Add more cases for other option types as needed
      }
    });
  }

  return options;
}
