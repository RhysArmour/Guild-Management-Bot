import { CommandInteractionOptionResolver } from 'discord.js';
import { client } from '../bot';
import { Event } from '../classes/Event';
import { ExtendedInteraction } from '../interfaces/discord/Command';
import { Logger } from '../logger';

interface IInteractionResult {
  message: string;
  content: unknown;
}

export default new Event('interactionCreate', async (interaction) => {
  // Chat Input Commands
  if (interaction.isCommand()) {
    Logger.info('Starting Interaction');
    await interaction.deferReply();
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      Logger.error('Interaction Failed. Non-Existing Command.');
      return interaction.followUp('You have used a non-existing command');
    }

    try {
      Logger.info(`Executing command: ${command.name}`);
      const result: IInteractionResult = await command.execute({
        args: interaction.options as CommandInteractionOptionResolver,
        client,
        interaction: interaction as ExtendedInteraction,
      });

      // Successful execution
      Logger.info('Command executed successfully!');
      await interaction.followUp({
        content: result.message,
        ephemeral: true,
      });
    } catch (error) {
      Logger.error(`Error while executing ${command.name}: ${error}`);
      // Error during execution
      await interaction.followUp('An error occurred while executing the command.');
    }
  }
});
