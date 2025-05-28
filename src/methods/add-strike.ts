import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { Logger } from '../logger';
import { Account, Member, Server, Strikes, DiscordUser } from '../../db/models';
import { StrikeRepository } from '../database/repositories/strikes-repository';
import { AccountRepository } from '../database/repositories/account-repository';
import { StrikeEmbedFactory } from '../classes/embed-factory';
import { choices } from '../utils/helpers/commandVariables';
import { generateStrikeDetailsEmbed } from '../utils/helpers/util-functions';
import { MemberRepository } from '../database/repositories/member-repository';

export const addStrike = async (interaction: ChatInputCommandInteraction, server: Server): Promise<void> => {
  try {
    Logger.info('Executing add strike subcommand...');

    const userOptions = Array.from({ length: 5 }, (_, i) =>
      interaction.options.getString(`user${i + 1}`, false),
    ).filter(Boolean);

    if (userOptions.length === 0) {
      const embed = StrikeEmbedFactory.createSadPathEmbed(
        'Add Strike',
        'You must provide at least one account to add a strike to.',
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    for (const [index, allyCode] of userOptions.entries()) {
      Logger.info(`Fetching account for ally code: ${allyCode}`);

      const account = await new AccountRepository().findByAllyCode(allyCode, {
        include: [
          {
            model: Member,
            as: 'member',
            include: [{ model: Account, as: 'accounts', include: [{ model: Strikes, as: 'strikes' }] }],
          },
          {
            model: DiscordUser,
            as: 'user',
          },
        ],
      });

      if (!account) {
        Logger.warn(`No account found for ally code: ${allyCode}`);
        const embed = StrikeEmbedFactory.createSadPathEmbed(
          'Add Strike',
          `No account found for ally code: ${allyCode}.`,
        );
        await interaction.followUp({ embeds: [embed], ephemeral: true });
        continue;
      }

      Logger.info(`Generating strike menu for account: ${account.displayName}`);

      const menu = generateStrikeReasonMenu(index + 1);

      const embed = StrikeEmbedFactory.createBaseEmbed({
        title: `Add Strike for ${account.displayName}`,
        description: `Select a reason for the strike from the menu below.`,
        color: 0xffcc00,
      });

      const response = await interaction.followUp({
        embeds: [embed],
        components: [menu],
        ephemeral: true,
        withResponse: true,
      });

      const filter = (i: StringSelectMenuInteraction) =>
        i.customId === `strike-reason-${index + 1}` && i.user.id === interaction.user.id;

      const collector = response.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on('collect', async (menuInteraction: StringSelectMenuInteraction) => {
        await menuInteraction.deferUpdate();

        const assignedDateInput = interaction.options.getString('assigned_date', false);
        const assignedDate = assignedDateInput ? new Date(assignedDateInput) : null;

        await handleStrikeMenuInteraction(menuInteraction, account, server, assignedDate);

        collector.stop();
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          const timeoutEmbed = StrikeEmbedFactory.createSadPathEmbed(
            'Add Strike',
            `You did not select a reason in time for account: ${account.displayName}.`,
          );
          interaction.editReply({ embeds: [timeoutEmbed] });
        }
      });
    }
  } catch (error) {
    Logger.error(`Error in addStrike: ${error}`);
    const embed = StrikeEmbedFactory.createSadPathEmbed('Add Strike', 'An error occurred while adding the strike.');
    await interaction.editReply({ embeds: [embed] });
  }
};
function generateStrikeReasonMenu(userIndex: number): ActionRowBuilder<StringSelectMenuBuilder> {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`strike-reason-${userIndex}`)
    .setPlaceholder('Select a reason for the strike')
    .addOptions(
      choices.map((choice) => ({
        label: choice.name,
        value: choice.value,
      })),
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

export async function handleStrikeMenuInteraction(
  interaction: StringSelectMenuInteraction,
  account: Account,
  server: Server,
  assignedDate: Date | null,
): Promise<void> {
  const reason = interaction.values[0]; // Selected reason from the menu

  Logger.info(`Adding strike for account: ${account.displayName}, Reason: ${reason}`);
  Logger.info({ accountId: account.allyCode, memberId: account.memberId, assignedDate }, 'Strike creation input data');

  // Create the strike
  const strike = await new StrikeRepository().createStrike(account, reason, assignedDate);
  Logger.info(`Strike created with ID: ${strike.id} for account: ${account.displayName}`);

  const memberRecord = await new MemberRepository().findById(account.memberId, {
    include: [{ model: Account, as: 'accounts', include: [{ model: Strikes, as: 'strikes' }] }],
  });
  Logger.info(
    { memberId: account.memberId, activeStrikeCount: memberRecord.activeStrikeCount },
    'Fetched member record after strike creation',
  );

  if (memberRecord.activeStrikeCount >= server.strikeLimit) {
    Logger.info(
      `Member ${memberRecord.displayName} has reached or exceeded the strike limit (${server.strikeLimit}). Attempting to assign strike limit role.`,
    );
    try {
      const discordMember = await interaction.client.guilds.cache
        .get(server.serverId)
        ?.members.fetch(memberRecord.discordId);

      if (discordMember) {
        await discordMember.roles.add(server.roles.strikeLimitRoleId);
        Logger.info(
          `Assigned strike limit role (${server.roles.strikeLimitRoleId}) to Discord member: ${discordMember.displayName}`,
        );
      } else {
        Logger.warn(`Discord member not found for Discord ID: ${memberRecord.discordId}`);
      }
    } catch (error) {
      Logger.error(`Failed to assign strike limit role to Discord member: ${memberRecord.displayName}`, {
        error: error,
      });
    }
  }

  const discordUser = await interaction.guild.members.fetch(memberRecord.discordId).catch(() => null);

  Logger.info({ discordUserFound: !!discordUser, discordUserId: memberRecord.discordId }, 'Discord user lookup');

  const sortedAccounts = memberRecord.accounts.sort((a, b) => {
    if (a.alt === b.alt) {
      return a.displayName.localeCompare(b.displayName); // Secondary sort by displayName
    }
    return a.alt ? 1 : -1; // If `alt` is true, it goes after `alt: false`
  });
  Logger.info({ sortedAccounts: sortedAccounts.map((a) => a.displayName) }, 'Sorted accounts for embed');

  // Generate the embed
  const embed = generateStrikeDetailsEmbed(
    server,
    interaction.user,
    discordUser,
    memberRecord,
    sortedAccounts,
    memberRecord.activeStrikeCount,
    `:x: Strike Added To ${memberRecord.displayName} - ${reason}`,
    `Here is a detailed breakdown of ${memberRecord.displayName}'s active strikes.`,
  );

  await discordUser.send({ embeds: [embed] }).catch((error) => {
    Logger.error(`Failed to send DM to ${discordUser.displayName}: ${error}`);
  });

  Logger.info(`Sent DM to ${discordUser.displayName} with strike details.`);

  Logger.info(`Editing reply with updated strike details for ${memberRecord.displayName}`);
  await interaction.deleteReply();
  await interaction.followUp({ embeds: [embed], components: [] });
  Logger.info(`Successfully added strike for account: ${account.displayName}`);
}
