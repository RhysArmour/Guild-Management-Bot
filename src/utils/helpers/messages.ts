import { EmbedBuilder } from '@discordjs/builders';
import { APIEmbed, Client, TextChannel } from 'discord.js';
import { Logger } from '../../logger';

interface MessageOptions {
  channelId: string;
  content: APIEmbed;
}

export const sendMessage = async (client: Client, options: MessageOptions) => {
  const channel = client.channels.cache.get(options.channelId) as TextChannel;
  if (!channel) {
    console.error('Channel not found!');
    return;
  }

  Logger.info('Setting Embed');

  const embed = new EmbedBuilder();

  // Dynamically set properties if they exist in options.content
  if (options.content.title) embed.setTitle(options.content.title);
  if (options.content.description) embed.setDescription(options.content.description);
  if (options.content.fields && options.content.fields.length > 0) embed.setFields(options.content.fields);
  if (options.content.color) embed.setColor(options.content.color);
  if (options.content.timestamp) embed.setTimestamp(new Date(options.content.timestamp));
  if (options.content.footer) embed.setFooter(options.content.footer);
  if (options.content.thumbnail) embed.setThumbnail(options.content.thumbnail.url);
  if (options.content.image) embed.setImage(options.content.image.url);
  if (options.content.author) embed.setAuthor(options.content.author);
  if (options.content.url) embed.setURL(options.content.url);

  Logger.info('Sending Message');
  channel.send({ embeds: [embed] });
};
