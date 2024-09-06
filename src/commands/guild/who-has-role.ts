import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { ApplicationCommandOptionType, Role } from 'discord.js';

export default new Command({
  name: 'whohasrole',
  description: 'Returns a list of members with the chosen role',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      type: ApplicationCommandOptionType.Role,
      name: 'role',
      description: 'The role you would like to check',
      required: true,
    },
  ],

  execute: async ({ interaction }) => {
    try {
      Logger.info('Beginning check roles');
      await interaction.guild.members.fetch();
      const role = interaction.options.getRole('role') as Role;
      const membersList = role.members.map((member) => member);

      let reply = `The following has the ${role.name} role:`;
      membersList.forEach((member) => {
        reply += `\n- ${member.displayName}`;
      });

      Logger.info('Check Roles Completed');
      return {
        title: 'Who has Role',
        fields: [{ name: 'Message', value: reply }],
      };
    } catch (error) {
      Logger.error(`Error: ${error}`);
      return {
        title: 'Error',
        fields: [{ name: 'Message', value: 'An issue occured whilst getting roles.' }],
      };
    }
  },
});

