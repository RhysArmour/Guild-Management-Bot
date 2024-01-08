import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { ApplicationCommandOptionType, Role } from 'discord.js';

export default new Command({
  name: 'removerole',
  description: 'Removes the chosen role from all members',
  defaultMemberPermissions: 'KickMembers',
  options: [
    {
      type: ApplicationCommandOptionType.Role,
      name: 'role',
      description: 'The role you would like to remove from all members',
      required: true,
    },
  ],

  execute: async ({ interaction }) => {
    try {
      Logger.info('Beginning Removing Roles');
      await interaction.guild.members.fetch();
      const role = interaction.options.getRole('role') as Role;
      console.log('roleObject.members', role.members);
      const membersList = role.members.map((member) => member);

      console.log('membersList', membersList);

      let reply = `The ${role.name} role has been removed from the following:`;
      membersList.forEach((member) => {
        member.roles.remove(role.id);
        reply += `\n- ${member.displayName}`;
      });

      Logger.info('Removing Roles Completed');
      return {
        content: undefined,
        message: reply,
      };
    } catch (error) {
      Logger.error(`Error: ${error}`);
    }
  },
});

