import { SlashCommandBuilder } from '@discordjs/builders';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { registerMembers } from '../../utils/database/services/server-services';

export default new Command({
  name: 'register',
  description: 'Registers all members with guild role with bot',


  execute: async ({ interaction }) => {
    interaction.followUp({
      content: 'Beggining to Register Member',
      ephemeral: true
    });
    return registerMembers(interaction) 
  },
});