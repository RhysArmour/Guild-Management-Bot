import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { ServerWithRelations } from '../../interfaces/database/server-table-interface';

export default new Command({
  name: 'checkallstrikes',
  description: 'Check strikes for all members',
  execute: async ({ interaction }, server: ServerWithRelations) => {
    try {
      const serverId = interaction.guildId;
      const result = server.members.filter((member) => member.strikes > 0);

      Logger.info(`Received strike list: ${JSON.stringify(result)}`);

      let message = '';
      const i = 0;

      result.forEach((item) => {
        message += `${i + 1}. Name: ${item.name} - Strikes: ${item.strikes} - Lifetime Strikes: ${
          item.lifetimeStrikes
        }\n`;
      });

      if (message === '') {
        message = 'There are currently no strikes within the guild.';
      }

      Logger.info(`Sending strike list response for server ID: ${serverId}`);

      return {
        title: 'Check All Strikes',
        fields: [{ name: 'Message', value: message }],
      };
    } catch (error) {
      Logger.error(`Error while checking all strikes: ${error}`);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occured whilst checking all active strikes.' }],
      };
    }
  },
});
