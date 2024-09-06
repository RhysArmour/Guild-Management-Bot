import { APIEmbed, CommandInteractionOptionResolver } from 'discord.js';
import { client } from '../bot';
import { Event } from '../classes/Event';
import { ExtendedAutocompleteInteraction, ExtendedInteraction } from '../interfaces/discord/Command';
import { Logger } from '../logger';
import { ServerTableService } from '../database/services/server-services';

export default new Event('interactionCreate', async (interaction) => {
  // Chat Input Commands
  if (interaction.isChatInputCommand()) {
    Logger.info('Starting Interaction');
    await interaction.deferReply();
    Logger.info('Reply deferred');
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      Logger.error('Interaction Failed. Non-Existing Command.');
      return interaction.followUp('You have used a non-existing command');
    }
    Logger.info('Received Command List.');
    try {
      Logger.info(`Executing command: ${command.name}`);
      Logger.info(`Checking server has been registered for server: ${interaction.guildId}`);
      const server = await ServerTableService.getServerTableByServerId(interaction.guildId);
      if (command.name !== 'setupserver' && !server) {
        Logger.warn(`Server: ${interaction.guildId} has not been configured.`);
        await interaction.followUp(
          'Server has not been set up. Please set up the server using the command: \n- `/setupserver`\n- `/setuproles`\n- `/setuplimits`\n- `/setupchannels`',
        );
        return;
      }
      const result: APIEmbed = await command.execute(
        {
          args: interaction.options as CommandInteractionOptionResolver,
          client,
          interaction: interaction as ExtendedInteraction,
        },
        server,
      );

      // Successful execution
      Logger.info('Command executed successfully!');
      await interaction.followUp({ embeds: [result] });
    } catch (error) {
      Logger.error(`Error while executing ${command.name}: ${error}`);
      // Error during execution
      await interaction.followUp('An error occurred while executing the command.');
    }
  } else if (interaction.isAutocomplete()) {
    Logger.info('Starting Auto Complete Interaction');
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.autocomplete({
        args: interaction.options as CommandInteractionOptionResolver,
        client,
        interaction: interaction as ExtendedAutocompleteInteraction,
      });
    } catch (error) {
      Logger.error(`Error while executing ${command.name}: ${error}`);
    }
  }
});
