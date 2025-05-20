import { Collection, Message, Role, User } from 'discord.js';
import { Logger } from '../logger';

const fetchMessageReactions = async (message: Message): Promise<Collection<string, User>[]> => {
  try {
    Logger.info('Fetching message reactions');
    const reactedUsers: Collection<string, User>[] = [];

    const reactions = message.reactions.cache;

    for await (const reaction of reactions) {
      const users = await reaction[1].users.fetch();
      reactedUsers.push(users);
    }

    return reactedUsers;
  } catch (error) {
    Logger.error('Error fetching message reactions:', error);
    throw error;
  }
};

export const getReactions = async (message: Message, role: Role): Promise<string> => {
  try {
    Logger.info('Starting getReactions Method');

    // Fetch all members in the guild to ensure the cache is populated
    await message.guild.members.fetch();

    // Fetch reactions for the message
    const users = await fetchMessageReactions(message);

    // Flatten the list of users who reacted and extract their IDs
    const reactedUserIds: string[] = users.flatMap((userCollection) => userCollection.map((user) => user.id));

    if (reactedUserIds.length === 0) {
      return 'There are currently no reactions on this message.';
    }

    // Filter members with the role who haven't reacted
    const roleMemberIds = role.members.map((member) => member.id);
    const nonReactedMemberIds = roleMemberIds.filter((memberId) => !reactedUserIds.includes(memberId));

    if (nonReactedMemberIds.length === 0) {
      return `All members with the ${role.name} role have reacted to the message.`;
    }

    // Format the response with mentions of non-reacted members
    const nonReactedMentions = nonReactedMemberIds.map((memberId) => `<@${memberId}>`).join('\n');

    Logger.info('Finished getReactions Method');
    return `The following ${nonReactedMemberIds.length} members have not reacted to the linked message: ${message.url}:\n${nonReactedMentions}`;
  } catch (error) {
    Logger.error('Error in getReactions:', error);
    return 'An error occurred while processing reactions.';
  }
};
