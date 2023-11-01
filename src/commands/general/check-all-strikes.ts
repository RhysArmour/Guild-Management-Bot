import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { MemberTableServices } from '../../database/services/member-services';

export default new Command({
  name: 'checkallstrikes',
  description: 'Check strikes for all members',
  execute: async ({ interaction }) => {
    try {
      const serverId = interaction.guildId;
      const result = await MemberTableServices.getAllGuildStrikesByInteraction(interaction);

      Logger.info(`Received strike list: ${JSON.stringify(result)}`);

      let message = '';
      const i = 0;

      result.forEach((item) => {
        message += `${i + 1}. Name: ${item.name} - Strikes: ${item.strikes} - Lifetime Strikes: ${
          item.lifetimeStrikes
        }\n`;
      });

      Logger.info(`Sending strike list response for server ID: ${serverId}`);

      return {
        content: result,
        message,
      };
    } catch (error) {
      Logger.error(`Error while checking all strikes: ${error}`);
      await interaction.reply({
        content: 'An error occurred while checking all strikes.',
        ephemeral: true,
      });
    }
  },
});
