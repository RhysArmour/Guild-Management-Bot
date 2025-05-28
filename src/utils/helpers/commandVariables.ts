import { AutocompleteInteraction } from 'discord.js';
import { AccountRepository } from '../../database/repositories/account-repository';
import { Member } from '../../../db';
import { Logger } from '../../logger';

export const choices = [
  { name: 'Ticket Strike', value: 'Ticket Strike' },
  { name: 'TB - Failed To Deploy Before Final Hour', value: 'TB - Failed To Deploy Before Final Hour' },
  { name: 'TB - Never Hit Combat Mission Wave Target', value: 'TB - Never Hit Combat Mission Wave Target' },
  { name: 'TB - Phase 1 Offense', value: 'TB - Phase 1 Offense' },
  { name: 'TB - Phase 2 Offense', value: 'TB - Phase 2 Offense' },
  { name: 'TB - Phase 3 Offense', value: 'TB - Phase 3 Offense' },
  { name: 'TB - Phase 4 Offense', value: 'TB - Phase 4 Offense' },
  { name: 'TB - Phase 5 Offense', value: 'TB - Phase 5 Offense' },
  { name: 'TB - Phase 6 Offense', value: 'TB - Phase 6 Offense' },
  { name: 'TB - Missed Special Mission', value: 'Missed Special Mission' },
  { name: 'TB - Failed Special Mission without Officer Aid', value: 'Failed Special Mission without Officer Aid' },
  { name: 'TB - Failed To Place Assigned Ops', value: 'Failed To Place Assigned Ops' },
  { name: 'TW - Missed Signup', value: 'Missed Tw Signup' },
  { name: 'TW - Missed Minimum Banners', value: 'Missed Minimum Banners' },
  { name: 'TW - Missed Defense Phase', value: 'Missed Tw Defense Phase' },
  { name: 'TW - Missed Offense Phase', value: 'Missed Tw Offense Phase' },
  {
    name: 'TW - TW - Extremely late attacks during offense phase',
    value: 'TW - Extremely late attacks during offense phase',
  },
  { name: 'TW - Severe inefficiency during offense phase', value: 'TW - Severe inefficiency during offense phase' },
  {
    name: 'TW - Did not meet minimum rogue actions',
    value: 'TW - Did not meet minimum rogue actions',
  },
  { name: 'RAID - Missed Raid', value: 'RAID - Missed Raid' },

  { name: 'RAID - Scored Below Minimum Expected Score', value: 'RAID - Scored Below Minimum Expected Score' },
];

export const autocompleteChoices = [
  'Ticket Strike',
  'Failed Discord Check',
  'TB - Failed To Deploy Before Final hour',
  'TB - Never Hit Combat Mission Wave Target',
  'TB - Phase 1 Offense',
  'TB - Phase 2 Offense',
  'TB - Phase 3 Offense',
  'TB - Phase 4 Offense',
  'TB - Phase 5 Offense',
  'TB - Phase 6 Offense',
  'TB - Missed Special Mission',
  'TB - Failed Special Mission without Officer Aid',
  'TB - Failed To Place Assigned Ops',
  'TB - Filled Ops that were not assigned',
  'TW - Missed Signup',
  'TW - Missed Minimum Banners',
  'TW - Missed Defense Phase',
  'TW - Missed Offense Phase',
  'TW - Disobeying TW Orders',
  'TW - Did not meet minimum rogue actions',
  'TW - Extremely late attacks during offense phase',
  'TW - Severe inefficiency during offense phase',
  'RAID - Missed Raid',
  'RAID - Scored Below Minimum Expected Score',
];

export const strikeChoicesAutocomplete = async (interaction: AutocompleteInteraction) => {
  const focusedOption = interaction.options.getFocused(true);
  let choices = autocompleteChoices.slice(0, 25);
  let filtered = choices.filter((choice) => choice.toLowerCase().includes(focusedOption.value.toLowerCase()));
  if (!filtered) {
    choices = autocompleteChoices.slice(26);
    filtered = choices.filter((choice) => choice.includes(focusedOption.value));
  }

  return await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
};

/**
 * Fetches accounts associated with a server and formats them for autocomplete.
 * @param serverId - The ID of the server.
 * @returns An array of autocomplete options.
 */
export async function fetchAccountAutocompleteOptions(serverId: string) {
  try {
    Logger.info(`Fetching accounts associated with server ID: ${serverId}`);
    const accounts = await new AccountRepository().findAllByServer(serverId, {
      include: [{ model: Member, as: 'member' }],
    });

    Logger.info(`Found ${accounts.length} accounts. Formatting for autocomplete...`);

    const accountOptions = accounts.map((account) => ({
      name: `${account.member.displayName} (${account.displayName} - ${account.allyCode})`,
      value: account.allyCode,
    }));

    Logger.info('Successfully formatted account options for autocomplete.');
    return accountOptions;
  } catch (error) {
    Logger.error(`Error fetching account autocomplete options: ${error}`);
    return [];
  }
}
