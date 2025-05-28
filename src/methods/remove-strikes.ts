import { APIEmbed, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from 'discord.js';
import { Logger } from '../logger';
import { Account, Member, Server, Strikes } from '../../db/models';
import { StrikeRepository } from '../database/repositories/strikes-repository';
import { Op } from 'sequelize';
import { Duration, sub } from 'date-fns';

import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js';
import { generateStrikeDetailsEmbed } from '../utils/helpers/util-functions';
import { MemberRepository } from '../database/repositories/member-repository';
import { AccountRepository } from '../database/repositories/account-repository';
import { StrikeEmbedFactory } from '../classes/embed-factory';

export const createStrikeRemoveMenuAndEmbed = async (
  account: Account,
  server: Server,
  interaction: ChatInputCommandInteraction,
) => {
  const activeStrikes = account.strikes.filter((strike) => strike.active);

  if (activeStrikes.length === 0) {
    Logger.info(`No active strikes found for account: ${account.displayName}`);
    const memberRecord = await new MemberRepository().findById(account.memberId, {
      include: [
        {
          model: Account,
          as: 'accounts',
          include: [{ model: Strikes, as: 'strikes' }],
        },
      ],
    });
    const sortedAccounts = memberRecord.accounts.sort((a, b) => {
      if (a.alt === b.alt) {
        return a.displayName.localeCompare(b.displayName); // Secondary sort by displayName
      }
      return a.alt ? 1 : -1; // If `alt` is true, it goes after `alt: false`
    });
    return {
      embed: generateStrikeDetailsEmbed(
        server,
        interaction.user,
        interaction.guild.members.cache.find((member) => member.id === account.member.discordId),
        account.member,
        sortedAccounts, // Include the current account
        0, // Total active strikes is 0
        `No Active Strikes For ${account.displayName}`, // Title
        `${account.displayName} has no active strikes to remove. Here is a list of all accounts and strikes associated to the member.`, // Description
      ),
      menu: null,
    };
  }

  Logger.info(`Found ${activeStrikes.length} active strike(s) for account: ${account.displayName}`);

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select-strike')
    .setPlaceholder('Select one or more strikes to remove')
    .setMinValues(1) // Minimum 1 strike must be selected
    .setMaxValues(activeStrikes.length) // Allow selecting all strikes
    .addOptions(
      activeStrikes.map((strike, index) => ({
        label: `Strike ${index + 1}`,
        description: strike.reason,
        value: strike.id.toString(), // Use the strike ID as the value
      })),
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

  const embed = generateStrikeDetailsEmbed(
    server,
    interaction.user,
    interaction.guild.members.cache.find((member) => member.id === account.member.discordId),
    account.member,
    [account],
    activeStrikes.length,
    `Remove Strikes Options For: ${account.member.displayName}`,
    `Here are the active strikes for the account "${account.displayName}".`,
  );

  return { embed, menu: row };
};

export const sendStrikeRemoveMenuAndAwaitInteraction = async (
  interaction: ChatInputCommandInteraction,
  embed: APIEmbed,
  menu: ActionRowBuilder<StringSelectMenuBuilder>,
) => {
  Logger.info('Sending dropdown menu and embed to the user...');
  const responseMessage = await interaction.followUp({
    embeds: [embed],
    components: [menu],
    ephemeral: true,
  });

  Logger.info('Dropdown menu and embed sent to the user.');

  const filter = (item: StringSelectMenuInteraction) =>
    item.customId === 'select-strike' && item.user.id === interaction.user.id;

  const collector = responseMessage.createMessageComponentCollector({ filter, time: 60000 });

  return collector;
};

export const handleSelection = async (menuInteraction: StringSelectMenuInteraction) => {
  await menuInteraction.deferUpdate(); // Acknowledge the interaction
  const selectedStrikeIds = menuInteraction.values; // Get the selected strike IDs
  Logger.info(`User selected strike IDs: ${selectedStrikeIds.join(', ')}`);

  try {
    const deletedStrikes = [];

    for (const strikeId of selectedStrikeIds) {
      // Find the strike to delete
      const strikeToDelete = await new StrikeRepository().findById(strikeId);

      if (!strikeToDelete) {
        Logger.error(`Strike with ID ${strikeId} not found.`);
        continue; // Skip this strike and move to the next
      }

      // Mark the strike as inactive and delete it
      strikeToDelete.set({ active: false });
      await strikeToDelete.save();

      await strikeToDelete.destroy({ force: true });
      Logger.info(`Strike with ID ${strikeId} deleted successfully.`);
      deletedStrikes.push(strikeToDelete);
    }

    // Return the deleted strikes for further processing
    return deletedStrikes;
  } catch (error) {
    Logger.error(`Error handling strike deletion: ${error}`);
    await menuInteraction.followUp({
      content: 'An error occurred while removing the strikes. Please try again.',
      ephemeral: true,
    });
  }
};

export const generateRemoveStrikeEmbed = async (
  menuInteraction: StringSelectMenuInteraction,
  allyCode: string,
  deletedStrikes: Strikes[],
) => {
  try {
    // Fetch the updated member record
    const accountRecord = await new AccountRepository().findByAllyCode(allyCode);
    const memberRecord = await new MemberRepository().findById(`${accountRecord.memberId}`, {
      include: [
        {
          model: Account,
          as: 'accounts',
          include: [{ model: Strikes, as: 'strikes' }],
        },
        {
          model: Server,
          as: 'server',
        },
      ],
    });

    if (!memberRecord) {
      Logger.error(`Member record not found for Discord ID: ${accountRecord.discordId}`);
      return menuInteraction.followUp({
        content: `Member record not found.`,
        ephemeral: true,
      });
    }

    // Sort accounts and generate the updated embed
    const sortedAccounts = memberRecord.accounts.sort((a, b) => {
      if (a.alt === b.alt) {
        return a.displayName.localeCompare(b.displayName); // Secondary sort by displayName
      }
      return a.alt ? 1 : -1; // If `alt` is true, it goes after `alt: false`
    });

    const discordUser = await menuInteraction.guild.members.fetch(memberRecord.discordId).catch(() => null);

    const embed = generateStrikeDetailsEmbed(
      memberRecord.server,
      menuInteraction.user,
      menuInteraction.guild.members.cache.find((member) => member.id === memberRecord.discordId),
      memberRecord,
      sortedAccounts,
      memberRecord.activeStrikeCount, // Update this as needed
      `Strikes Removed for ${memberRecord.displayName}`,
      `The following strikes have been successfully removed:\n${deletedStrikes
        .map((strike) => `- ${strike.reason}`)
        .join('\n')}\n\nHere is the updated list of active strikes for ${memberRecord.displayName}.`,
    );

    await discordUser.send({
      embeds: [embed],
    });
    Logger.info(`Sent DM to ${discordUser.displayName} with updated strike details.`);

    // Update the interaction with the new embed
    await menuInteraction.editReply({
      content: undefined,
      embeds: [embed],
      components: [],
    });

    Logger.info('Dropdown menu and embed removed successfully.');
  } catch (error) {
    Logger.error(`Error fetching member record or generating embed: ${error}`);
    await menuInteraction.followUp({
      content: 'An error occurred while updating the member record. Please try again.',
      ephemeral: true,
    });
  }
};

function createExpireAllConfirmationRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('confirm-expire').setLabel('Yes').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('cancel-expire').setLabel('No').setStyle(ButtonStyle.Secondary),
  );
}

export async function handleExpireAllConfirmation(
  interaction: ChatInputCommandInteraction,
  server: Server,
): Promise<void> {
  const row = createExpireAllConfirmationRow();

  const embed = StrikeEmbedFactory.createBaseEmbed({
    title: 'Expire All Strikes',
    description: `Are you sure you want to expire all active strikes for the past ${server.strikeResetPeriod}?`,
    color: 0xffcc00,
  });

  await interaction.editReply({ embeds: [embed], components: [row] });

  const filter = (i) => i.customId === 'confirm-expire' || i.customId === 'cancel-expire';
  const collector = interaction.channel.createMessageComponentCollector({
    filter,
    time: 15000,
  });

  collector.on('collect', async (buttonInteraction) => {
    if (buttonInteraction.customId === 'confirm-expire') {
      await expireAllStrikes(server.serverId);
      const successEmbed = StrikeEmbedFactory.createHappyPathEmbed(
        'Expire All Strikes',
        'All active strikes have been successfully expired.',
      );
      await buttonInteraction.update({ embeds: [successEmbed], components: [] });
    } else if (buttonInteraction.customId === 'cancel-expire') {
      const cancelEmbed = StrikeEmbedFactory.createSadPathEmbed(
        'Expire All Strikes',
        'The operation to expire all strikes has been canceled.',
      );
      await buttonInteraction.update({ embeds: [cancelEmbed], components: [] });
    }
    collector.stop();
  });

  collector.on('end', (collected, reason) => {
    if (reason === 'time') {
      const timeoutEmbed = StrikeEmbedFactory.createSadPathEmbed(
        'Expire All Strikes',
        'The operation to expire all strikes has timed out.',
      );
      interaction.editReply({ embeds: [timeoutEmbed], components: [] });
    }
  });
}

async function expireAllStrikes(serverId: string): Promise<void> {
  await Strikes.update(
    { active: false },
    {
      where: {
        serverId,
        active: true,
      },
    },
  );
  Logger.info('All active strikes have been expired.');
}

export async function fetchStrikesToUpdate(server: Server): Promise<Strikes[]> {
  const resetPeriod = server.getDataValue('strikeResetPeriod'); // e.g., 'P1M' (1 month), 'P1W' (1 week)
  const resetDate = sub(new Date(), parseISODuration(resetPeriod));

  return await Strikes.findAll({
    where: {
      serverId: server.serverId,
      active: true,
      assignedDate: {
        [Op.lt]: resetDate, // Find strikes older than the reset period
      },
    },
    include: [
      {
        model: Account,
        as: 'account',
        include: [{ model: Member, as: 'member' }],
      },
    ],
  });
}

function parseISODuration(duration: string): Duration {
  const match = duration.match(/P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?/);
  if (!match) throw new Error('Invalid ISO 8601 duration format');

  return {
    years: parseInt(match[1] || '0', 10),
    months: parseInt(match[2] || '0', 10),
    weeks: parseInt(match[3] || '0', 10),
    days: parseInt(match[4] || '0', 10),
  };
}

export async function deactivateStrikes(strikes: Strikes[]): Promise<void> {
  const strikeIds = strikes.map((strike) => strike.id);
  await Strikes.update(
    { active: false },
    {
      where: {
        id: {
          [Op.in]: strikeIds,
        },
      },
    },
  );
}
