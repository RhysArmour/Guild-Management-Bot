import { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Logger } from '../logger';
import { MemberTableServices } from '../database/services/member-services';

const fetchMessageReactions = async (message) => {
  Logger.info('Fetching message reactions');
  const reactions = message.reactions.cache;
  const reactedUsers = [];

  for (const reaction of reactions.values()) {
    console.log('REACTION', reaction);
    const users = await reaction.users.fetch();
    console.log('USERS', users);
    reactedUsers.push(users);
  }

  return reactedUsers;
};

function removeDuplicates(arrayOfStrings) {
  Logger.info('Removing duplicates');
  return arrayOfStrings.filter(
    (element, index) =>
      !arrayOfStrings.some((otherElement, otherIndex) => index !== otherIndex && element === otherElement),
  );
}

export const getReactions = async (interaction: ChatInputCommandInteraction) => {
  try {
    Logger.info('Starting getReactions Method');
    const messageId = interaction.options.getString('messageid');
    const channel = interaction.options.getChannel('channel');

    const guildChannel = (await interaction.guild.channels.fetch(channel.id)) as TextChannel;
    const message = await guildChannel.messages.fetch(messageId);

    const reactedUsers = await fetchMessageReactions(message);
    console.log('REACTEDUSERS', reactedUsers);
    const usernames = reactedUsers.flatMap((user) => user.map((u) => u.username));

    if (usernames.length === 0) {
      return {
        content: undefined,
        message: 'There are currently no reactions on this message',
      };
    }

    const members = await MemberTableServices.getAllMembersByServerId(interaction.guildId);
    const membersNames = members.map((member) => member.username);

    const filteredList = removeDuplicates([...usernames, ...membersNames]);

    console.log('FILTERED LIST', filteredList);

    const displayNames = await Promise.all(
      filteredList.map(async (username) => {
        const nameRecord = await MemberTableServices.getAllMembersDisplayNamesByServerId(interaction.guildId, username);
        return nameRecord.name;
      }),
    );

    const formattedResponse = displayNames.map((name) => `- ${name}`).join('\n');

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

