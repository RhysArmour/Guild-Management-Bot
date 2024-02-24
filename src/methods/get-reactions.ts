import { ChatInputCommandInteraction, Collection, Message, Role, TextChannel, User } from 'discord.js';
import { Logger } from '../logger';

const fetchMessageReactions = async (interaction: ChatInputCommandInteraction) => {
  try {
    Logger.info('Fetching message reactions');
    let reactedUsers: Collection<string, User>;
    const messageId = interaction.options.getString('messageid');
    const channel = interaction.options.getChannel('channel') as TextChannel;
    const guildChannel = (await interaction.guild.channels.fetch(channel.id)) as TextChannel;
    const message = (await guildChannel.messages.fetch(messageId)) as Message;

    const reactions = message.reactions.cache;

    for await (const reaction of reactions) {
      const user = await reaction[1].users.fetch();
      reactedUsers = user;
    }

    return reactedUsers;
  } catch (error) {
    Logger.error(error);
  }
};

export const getReactions = async (interaction: ChatInputCommandInteraction) => {
  try {
    Logger.info('Starting getReactions Method');

    await interaction.guild.members.fetch();

    const role = interaction.options.getRole('role') as Role;

    const users = await fetchMessageReactions(interaction);

    const usernames: string[] = users.map((user) => user.username);

    if (usernames.length === 0) {
      return {
        content: undefined,
        message: 'There are currently no reactions on this message',
      };
    }

    const filteredReactions = Array.from(new Set(usernames));

    const allMembers = role.members.map((member) => member.user.username);

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

