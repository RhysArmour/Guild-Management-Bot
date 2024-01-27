import { ChatInputCommandInteraction, Message, Role, TextChannel } from 'discord.js';
import { Logger } from '../logger';

const fetchMessageReactions = async (message: Message) => {
  Logger.info('Fetching message reactions');
  const reactions = message.reactions.cache;
  const fetchPromises = [];

  for (const reaction of reactions.values()) {
    fetchPromises.push(reaction.users.fetch());
  }

  return Promise.all(fetchPromises);
};

export const getReactions = async (interaction: ChatInputCommandInteraction) => {
  try {
    Logger.info('Starting getReactions Method');
    await interaction.guild.members.fetch();
    const messageId = interaction.options.getString('messageid');
    const channel = interaction.options.getChannel('channel') as TextChannel;
    const role = interaction.options.getRole('role') as Role;

    const guildChannel = (await interaction.guild.channels.fetch(channel.id)) as TextChannel;
    const message = await guildChannel.messages.fetch(messageId);

    const reactedUsers = await fetchMessageReactions(message);

    const usernames: string[] = reactedUsers.flatMap((user) => user.map((u) => u.username));

    if (usernames.length === 0) {
      return {
        content: undefined,
        message: 'There are currently no reactions on this message',
      };
    }

    const filteredReactions = Array.from(new Set(usernames));

    const allMembers = (await message.guild.roles.fetch(role.id)).members.map((member) => member.user.username);

    const filteredMembers = allMembers.filter((member) => !filteredReactions.includes(member));

    const formattedResponse = filteredMembers.map((name) => `- ${name}`).join('\n');

    Logger.info('Finished getReactions Method');
    return {
      content: undefined,
      message: `The following have not reacted:\n${formattedResponse}`,
    };
  } catch (error) {
    Logger.error('Error in getReactions:', error);
    return {
      content: undefined,
      message: 'An error occurred while processing reactions.',
    };
  }
};

