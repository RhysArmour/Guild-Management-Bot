import { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Logger } from '../logger';
import { MemberTableServices } from '../database/services/member-services';

const fetchMessageReactions = async (message) => {
  const reactions = message.reactions.cache;
  const reactedUsers = [];

  for (const reaction of reactions.values()) {
    const users = await reaction.users.fetch();
    reactedUsers.push(users);
  }

  return reactedUsers;
};

function removeDuplicates(arrayOfStrings) {
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

    const usernames = reactedUsers.flatMap((user) => user.map((u) => u.username));

    const members = await MemberTableServices.getAllMembersByServerId(interaction.guildId);
    console.log('🚀 ~ file: get-reactions.ts:31 ~ getReactions ~ members:', ...members);

    const membersNames = [];
    members.forEach((member) => {
      membersNames.push(member.name);
    });

    const membersArray = usernames.concat(membersNames);
    console.log('🚀 ~ file: get-reactions.ts:34 ~ getReactions ~ membersArray:', membersArray);

    const filterList = removeDuplicates(membersArray);
    console.log('🚀 ~ file: get-reactions.ts:42 ~ filterList ~ filterList:', filterList);

    let formattedResponse = '';
    for (const username of filterList) {
      formattedResponse += `- ${username}\n`;
    }

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
