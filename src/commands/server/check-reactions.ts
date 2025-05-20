import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import { getReactions } from '../../methods/get-reactions';
import {
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Role,
  TextChannel,
} from 'discord.js';
import { Server } from '../../../db/models';

export default new Command({
  name: 'check-reactions',
  description: 'Check who in your guild role has reacted to the message and who has not.',
  options: [
    {
      name: `channel`,
      description: 'The channel that the message is in',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: `messageid`,
      description: 'The message Id of the message you wish to see the reactions for',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'role',
      description: 'Role of the members you want to check the reactions for',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],

  execute: async ({ interaction }, server: Server) => {
    try {
      Logger.info(`Beginning check reactions command for server: ${server.serverId}`);

      // Fetch the role and reactions
      const role = interaction.options.getRole('role') as Role;
      const channel = interaction.options.getChannel('channel') as TextChannel;
      const messageId = interaction.options.getString('messageid', true);

      if (!channel || !messageId) {
        const embed = {
          title: 'Error',
          description: 'Invalid channel or message ID provided.',
          color: 0xff0000,
        };
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const message = await channel.messages.fetch(messageId);
      const reactionsResult = await getReactions(message, role);

      if (!reactionsResult) {
        const embed = {
          title: 'Check Reactions',
          description: `No reactions found for the specified message.`,
          color: 0xffcc00,
        };
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Handle the case where all members have reacted
      if (reactionsResult.startsWith('All members')) {
        const embed = {
          title: 'Check Reactions',
          description: reactionsResult,
          color: 0x00ff00,
        };
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Create a "Tag Players" button
      const tagButton = new ButtonBuilder()
        .setCustomId('tag-players')
        .setLabel('Tag Players')
        .setStyle(ButtonStyle.Primary);

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(tagButton);

      // Reply with the embed and button
      const embed = {
        title: 'Check Reactions',
        description: reactionsResult,
        color: 0xffcc00,
      };

      await interaction.editReply({
        embeds: [embed],
        components: [actionRow],
      });

      // Handle button interaction
      const filter = (i) => i.customId === 'tag-players' && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000, // 15 seconds to interact with the button
      });

      collector.on('collect', async (buttonInteraction) => {
        // Remove the button from the original message
        await buttonInteraction.update({
          components: [], // Clear the components (buttons)
        });

        // Send a message tagging all non-reacted members
        await buttonInteraction.followUp(reactionsResult);

        await buttonInteraction.editReply({
          content: 'Players tagged successfully!',
          embeds: [],
        });

        collector.stop();
      });
      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          Logger.info('Tag Players button interaction timed out.');
        }
      });
      Logger.info('Check Reactions Completed');
      return;
    } catch (error) {
      Logger.error(`Error: ${error}`);
      const embed = {
        title: 'Error',
        description: 'An issue occurred while checking reactions.',
        color: 0xff0000,
      };
      await interaction.editReply({ embeds: [embed] });
    }
  },
});
