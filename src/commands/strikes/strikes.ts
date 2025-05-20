import { ApplicationCommandOptionType, AutocompleteInteraction, StringSelectMenuInteraction } from 'discord.js';
import { Logger } from '../../logger';
import { fetchAccountAutocompleteOptions, strikeChoicesAutocomplete } from '../../utils/helpers/commandVariables';
import { addStrike } from '../../methods/add-strike';
import { checkActiveStrikes, handleCheckAllSubcommand, strikeHistory } from '../../methods/check-strike';
import {
  createStrikeRemoveMenuAndEmbed,
  deactivateStrikes,
  fetchStrikesToUpdate,
  generateRemoveStrikeEmbed,
  handleExpireAllConfirmation,
  handleSelection,
  sendStrikeRemoveMenuAndAwaitInteraction,
} from '../../methods/remove-strikes';
import { ServerRepository } from '../../database/repositories/server-repository';
import { Account, Channels, Member, Roles, Strikes } from '../../../db';
import { Command } from '../../classes/Commands';
import { AccountRepository } from '../../database/repositories/account-repository';
import { StrikeEmbedFactory } from '../../classes/embed-factory';
import { StrikeRepository } from '../../database/repositories/strikes-repository';
import { MemberRepository } from '../../database/repositories/member-repository';

export default new Command({
  name: 'strikes',
  description: 'Strike super command',
  options: [
    {
      name: 'add',
      description: 'Add strike(s) to player(s)',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        ...Array.from({ length: 5 }, (_, i) => ({
          type: ApplicationCommandOptionType.String,
          name: `user${i + 1}`,
          description: `Account ${i + 1} to add a strike to`,
          required: i === 0, // Only the first account is required
          autocomplete: true,
        })),
      ],
    },
    {
      name: 'remove',
      description: 'removes strike(s) from player(s)',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        ...Array.from({ length: 10 }, (_, i) => ({
          name: `user${i + 1}`,
          description: `Member ${i + 1} you want to remove strikes from`,
          type: ApplicationCommandOptionType.String,
          required: i === 0, // Only the first user is required
          autocomplete: true,
        })),
      ],
    },
    {
      name: 'check',
      description: 'show a players strike(s) for the current month',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        ...Array.from({ length: 10 }, (_, i) => ({
          name: `user${i + 1}`,
          description: 'The user that you would like to see the strikes for.',
          type: 6,
          required: false,
        })),
      ],
    },
    {
      name: 'history',
      description: 'show a players historical strike data',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'user',
          description: 'Member you want to see historical strikes for',
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    },
    {
      name: 'check-all',
      description: 'Check all active strikes for the server',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'expire-all',
      description: 'Expire all active strikes for the server',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'update',
      description: 'Update active strikes based on the current strike reset period',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  autocomplete: async ({ interaction }: { interaction: AutocompleteInteraction }) => {
    try {
      Logger.info('Autocomplete triggered.');
      const focusedOption = interaction.options.getFocused(true);
      Logger.info(`Focused option: ${focusedOption.name}`);

      // Handle user autocomplete (e.g., user1, user2, etc.)
      if (focusedOption.name.startsWith('user')) {
        Logger.info('Handling user autocomplete...');
        const serverId = interaction.guildId;
        if (!serverId) {
          Logger.warn('No server ID found in interaction.');
          return interaction.respond([]);
        }

        Logger.info(`Fetching server with ID: ${serverId}`);
        const server = await new ServerRepository().findById(serverId);
        if (!server) {
          Logger.warn(`No server found with ID: ${serverId}`);
          return interaction.respond([]);
        }

        const accountOptions = await fetchAccountAutocompleteOptions(serverId);
        return interaction.respond(accountOptions);
      }
      if (focusedOption.name.startsWith('strike')) {
        Logger.info('Handling strike autocomplete...');
        const serverId = interaction.guildId;
        if (!serverId) {
          Logger.warn('No server ID found in interaction.');
          return interaction.respond([]);
        }

        Logger.info(`Fetching server with ID: ${serverId}`);
        const server = await new ServerRepository().findById(serverId);
        if (!server) {
          Logger.warn(`No server found with ID: ${serverId}`);
          return interaction.respond([]);
        }

        const accountOptions = await fetchAccountAutocompleteOptions(serverId);
        return interaction.respond(accountOptions);
      }
      // Handle reason autocomplete (e.g., reason1, reason2, etc.)
      if (focusedOption.name.startsWith('reason')) {
        Logger.info('Handling reason autocomplete...');
        return await strikeChoicesAutocomplete(interaction);
      }

      Logger.warn('No matching autocomplete handler found.');
      return interaction.respond([]);
    } catch (error) {
      Logger.error(`Error in strikes autocomplete: ${error}`);
      await interaction.respond([]);
    }
  },
  execute: async ({ interaction }) => {
    try {
      Logger.info('Executing strikes command...');
      const subcommand = interaction.options.getSubcommand();
      const serverId = interaction.guildId;

      if (!serverId) {
        Logger.error('No guild ID found in interaction.');
        const embed = StrikeEmbedFactory.createSadPathEmbed('Strikes Command', 'No guild ID found in the interaction.');
        return interaction.editReply({ embeds: [embed] });
      }

      Logger.info(`Fetching server with ID: ${serverId}`);
      const server = await new ServerRepository().findById(serverId, {
        include: [
          { model: Channels, as: 'channels' },
          { model: Roles, as: 'roles' },
          { model: Member, as: 'members', include: [{ model: Account, as: 'accounts' }] },
        ],
      });

      if (!server) {
        Logger.error(`No server found with ID: ${serverId}`);
        const embed = StrikeEmbedFactory.createSadPathEmbed(
          'Strikes Command',
          'Server not found. Please ensure the server is properly configured.',
        );
        interaction.editReply({ embeds: [embed] });
        return;
      }

      const registeredUser = await new MemberRepository().findServerMember(server.serverId, interaction.user.id);

      if (!registeredUser) {
        interaction.editReply({
          content: 'You are not currently registered to this server and cannot run this command',
          flags: 64 as number,
        });
        return;
      }

      if (subcommand === 'add' || subcommand === 'remove' || subcommand === 'update' || subcommand === 'expire-all') {
        if (!interaction.memberPermissions?.has('KickMembers')) {
          interaction.editReply({
            content: 'You do not have permission to use this subcommand.',
            flags: 64 as number,
          });
          return;
        }
      }

      if (subcommand === 'add') {
        Logger.info('Executing add strike subcommand...');
        await addStrike(interaction, server);
        return;
      }

      if (subcommand === 'check') {
        Logger.info('Executing check strikes subcommand...');
        const embeds = await checkActiveStrikes(interaction, server);

        if (embeds.length > 0) {
          Logger.info(`Generated ${embeds.length} embed(s) for the check subcommand.`);
          await interaction.editReply({ embeds: [embeds[0]] });

          for (let i = 1; i < embeds.length; i++) {
            await interaction.followUp({ embeds: [embeds[i]] });
          }
        } else {
          const embed = StrikeEmbedFactory.createSadPathEmbed(
            'Check Strikes',
            'No strikes found for the provided users.',
          );
          await interaction.editReply({ embeds: [embed] });
        }
        return;
      }

      if (subcommand === 'history') {
        Logger.info('Executing history subcommand...');
        try {
          const user = interaction.options.getUser('user', true);
          Logger.info(`Fetching strike history for user: ${user.username} (ID: ${user.id})`);

          const embed = await strikeHistory(interaction, server, user);

          if (embed) {
            await interaction.editReply({ embeds: [embed] });
          } else {
            const sadEmbed = StrikeEmbedFactory.createSadPathEmbed(
              'History',
              `No strike history found for ${user.username}.`,
            );
            await interaction.editReply({ embeds: [sadEmbed] });
          }
          return;
        } catch (error) {
          Logger.error(`Error executing history subcommand: ${error}`);
          const embed = StrikeEmbedFactory.createSadPathEmbed(
            'History',
            'An error occurred while fetching the strike history.',
          );
          await interaction.editReply({ embeds: [embed] });
        }
      }

      if (subcommand === 'remove') {
        Logger.info('Executing remove strike subcommand...');
        try {
          const userOptions = Array.from({ length: 10 }, (_, i) =>
            interaction.options.getString(`user${i + 1}`, false),
          ).filter(Boolean);

          if (userOptions.length === 0) {
            const embed = StrikeEmbedFactory.createSadPathEmbed(
              'Remove Strikes',
              'You must provide at least one user to remove strikes from.',
            );
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            return;
          }

          for (const accountAllyCode of userOptions) {
            Logger.info(`Processing ally code: ${accountAllyCode}`);

            const account = await new AccountRepository().findByAllyCode(accountAllyCode, {
              include: [
                { model: Member, as: 'member', include: [{ model: Account, as: 'accounts' }] },
                { model: Strikes, as: 'strikes' },
              ],
            });

            if (!account) {
              const embed = StrikeEmbedFactory.createSadPathEmbed(
                'Remove Strikes',
                `No account found with ally code: ${accountAllyCode}`,
              );
              await interaction.followUp({ embeds: [embed], ephemeral: true });
              continue;
            }

            const { embed, menu } = await createStrikeRemoveMenuAndEmbed(account, server, interaction);

            if (!embed) {
              Logger.error('Failed to generate embed.');
              continue;
            }

            if (!menu) {
              await interaction.followUp({ embeds: [embed], ephemeral: true });
              continue;
            }

            const collector = await sendStrikeRemoveMenuAndAwaitInteraction(interaction, embed, menu);

            collector?.on('collect', async (menuInteraction: StringSelectMenuInteraction) => {
              const deletedStrikes = await handleSelection(menuInteraction);
              await generateRemoveStrikeEmbed(menuInteraction, accountAllyCode, deletedStrikes);
              collector.stop();
            });

            collector?.on('end', async (collected, reason) => {
              if (reason === 'time') {
                const embed = StrikeEmbedFactory.createSadPathEmbed(
                  'Remove Strikes',
                  `You did not select a strike in time for ally code: ${accountAllyCode}. Please try again.`,
                );
                await interaction.followUp({ embeds: [embed], ephemeral: true });
              }
            });
          }
        } catch (error) {
          Logger.error(`Error executing remove strike subcommand: ${error}`);
          const embed = StrikeEmbedFactory.createSadPathEmbed(
            'Remove Strikes',
            'An error occurred while removing the strikes.',
          );
          await interaction.followUp({ embeds: [embed], ephemeral: true });
        }
      }

      if (subcommand === 'check-all') {
        await handleCheckAllSubcommand(interaction, server);
        return;
      }

      if (subcommand === 'expire-all') {
        Logger.info('Executing expire-all strikes subcommand...');
        try {
          const activeStrikesCount = await new StrikeRepository().findActiveStrikes(serverId, {
            include: [{ model: Account, as: 'account' }],
          });

          if (activeStrikesCount.length === 0) {
            Logger.info('No active strikes to expire.');
            const embed = StrikeEmbedFactory.createSadPathEmbed(
              'Expire All Strikes',
              'There are no active strikes to expire for this server.',
            );
            await interaction.editReply({ embeds: [embed] });
            return;
          }

          Logger.info(`Found ${activeStrikesCount} active strikes to expire.`);
          await handleExpireAllConfirmation(interaction, server);
        } catch (error) {
          Logger.error(`Error executing expire-all strikes subcommand: ${error}`);
          const embed = StrikeEmbedFactory.createSadPathEmbed(
            'Expire All Strikes',
            'An error occurred while expiring active strikes.',
          );
          await interaction.editReply({ embeds: [embed] });
        }
      }

      if (subcommand === 'update') {
        Logger.info('Executing update strikes subcommand...');
        try {
          const strikesToUpdate = await fetchStrikesToUpdate(server);

          if (strikesToUpdate.length === 0) {
            Logger.info('No strikes to update.');
            const embed = StrikeEmbedFactory.createSadPathEmbed(
              'Update Strikes',
              'No active strikes were found that need to be updated.',
            );
            await interaction.editReply({ embeds: [embed] });
            return;
          }

          await deactivateStrikes(strikesToUpdate);

          const updatedStrikesList = strikesToUpdate
            .map(
              (strike) =>
                `👤 **Member:** ${strike.account.member.displayName}\n🛡️ **Account:** ${
                  strike.account.displayName
                }\n:x: **Reason:** ${strike.reason}\n📅 **Assigned Date:** ${
                  strike.assignedDate.toISOString().split('T')[0]
                }`,
            )
            .join('\n\n');

          const embed = StrikeEmbedFactory.createBaseEmbed({
            title: 'Updated Strikes',
            description: `The following strikes have been updated and marked as inactive:\n\n${updatedStrikesList}`,
            color: 0x00ff00, // Green for success
          });

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          Logger.error(`Error executing update strikes subcommand: ${error}`);
          const embed = StrikeEmbedFactory.createSadPathEmbed(
            'Update Strikes',
            'An error occurred while updating active strikes.',
          );
          await interaction.editReply({ embeds: [embed] });
        }
      }
    } catch (error) {
      Logger.error(`Error executing strikes command: ${error}`);
      const embed = StrikeEmbedFactory.createSadPathEmbed('Strikes Command', 'Something went wrong.');
      await interaction.editReply({ embeds: [embed] });
    }
  },
});
