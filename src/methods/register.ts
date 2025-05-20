import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { Logger } from '../logger';
import { Comlink } from '../classes/Comlink';
import { Account, Member, Server } from '../../db/models';
import { AccountRepository } from '../database/repositories/account-repository';
import { MemberRepository } from '../database/repositories/member-repository';
import { DiscordUserRepository } from '../database/repositories/user-repository';

export const register = async (interaction: ChatInputCommandInteraction, server: Server) => {
  try {
    Logger.info('Fetching all guild members...');
    await interaction.guild.members.fetch();

    Logger.info('Extracting interaction data...');
    const { member, allyCodes } = extractInteractionData(interaction);

    // Validate member and ally codes
    if (!member) {
      Logger.error('Member could not be resolved from the interaction.');
      throw new Error('Member could not be resolved from the interaction.');
    }
    if (allyCodes.filter(Boolean).length === 0) {
      Logger.error('No valid ally codes provided.');
      throw new Error('No valid ally codes provided.');
    }

    Logger.info(`Member extracted: ${member.displayName}`);
    Logger.info(`Ally codes extracted: ${allyCodes.filter(Boolean).join(', ')}`);

    Logger.info('Checking if the member is already registered...');
    const existingMember = await new MemberRepository().findById(`${server.serverId}-${member.user.id}`, {
      include: [{ model: Account, as: 'accounts' }],
    });

    if (existingMember) {
      Logger.info(
        `${existingMember.displayName} is already registered to ${server.serverName}. Attempting to register accounts.`,
      );
    } else {
      Logger.info(`Member ${member.displayName} is not registered. Proceeding with registration.`);
      await registerNewMember(server, member);
    }

    Logger.info('Processing ally codes for account registration...');
    const registrationResults = await processAllyCodes(existingMember, member, allyCodes);

    if (registrationResults.length === 0) {
      Logger.warn('No accounts were successfully registered.');
      return 'No accounts were successfully registered.';
    }

    Logger.info('Registration process completed. Returning results.');
    return registrationResults.join('\n');
  } catch (error) {
    Logger.error(`Error in registerMembers: ${error}`);
    throw new Error('Failed to register members');
  }
};

// Extracts the member and ally codes from the interaction
function extractInteractionData(interaction: ChatInputCommandInteraction) {
  Logger.info('Extracting ally codes from interaction...');
  const allyCode = interaction.options.getString('allycode');
  const altOne = interaction.options.getString('alt');
  const altTwo = interaction.options.getString('additionalalt');
  const allyCodes = [...new Set([allyCode, altOne, altTwo])]; // Deduplicate ally codes

  Logger.info('Extracting member from interaction...');
  let member = interaction.options.getMember('member') as GuildMember;
  if (!member) {
    Logger.info('No member specified in interaction. Defaulting to interaction author.');
    member = interaction.member as GuildMember;
  }

  return { member, allyCodes };
}

// Registers a new member and creates the necessary user and member records
async function registerNewMember(server: Server, member: GuildMember) {
  Logger.info(`Registering ${member.displayName} to ${server.serverName}.`);

  Logger.info(`Checking if user ${member.user.username} already exists...`);
  let userRecord = await new DiscordUserRepository().findByDiscordId(member.user.id);
  if (!userRecord) {
    Logger.info(`User ${member.user.username} does not exist. Creating new user.`);
    userRecord = await new DiscordUserRepository().createUser({
      discordId: member.user.id,
      userName: member.user.username,
      displayName: member.displayName,
    });
  } else {
    Logger.info(`User ${member.user.username} already exists.`);
  }

  Logger.info(`Checking if member ${member.displayName} already exists in the server...`);
  const existingMember = await new MemberRepository().findById(`${server.serverId}-${member.user.id}`, {
    include: [{ model: Account, as: 'accounts' }],
  });
  if (!existingMember) {
    Logger.info(`Creating new member record for ${member.displayName}.`);
    await new MemberRepository().createMember(server.serverId, {
      memberId: `${server.serverId}-${member.user.id}`,
      discordId: userRecord.discordId,
      displayName: member.displayName,
      serverId: server.serverId,
    });
  } else {
    Logger.info(`Member ${member.displayName} already exists in the server.`);
  }
}

// Processes the ally codes for the member, registering accounts if necessary
async function processAllyCodes(existingMember: Member, member: GuildMember, allyCodes: string[]) {
  const registrationResults: string[] = [];
  for (const allyCode of allyCodes) {
    Logger.info(`Processing ally code: ${allyCode}`);
    if (!allyCode) {
      Logger.warn(`Skipping invalid allyCode: ${allyCode}`);
      continue;
    }

    Logger.info(`Checking if account with Ally Code: ${allyCode} already exists...`);
    const existingAccounts = existingMember?.accounts || [];
    const existingAccount = existingAccounts.find((entry) => entry.allyCode === allyCode);

    if (existingAccount) {
      Logger.info(`Account with Ally Code: ${allyCode} already registered to ${member.displayName}.`);
      registrationResults.push(`Account with Ally Code: ${allyCode} already registered to ${member.displayName}.`);
      continue;
    }

    Logger.info(`Account with Ally Code: ${allyCode} does not exist. Attempting to register.`);
    try {
      Logger.info(`Fetching player data for Ally Code: ${allyCode}...`);
      const playerData = await Comlink.getPlayerByAllyCode(allyCode);

      if (allyCode === allyCodes[0]) {
        Logger.info(`Creating account for Ally Code: ${allyCode}...`);
        await new AccountRepository().createPrimaryAccount(member.id, member.guild.id, playerData);
      } else {
        Logger.info(`Creating alt account for Ally Code: ${allyCode}...`);
        await new AccountRepository().createAltAccount(member.id, member.guild.id, playerData);
      }

      Logger.info(`Account with Ally Code: ${allyCode} successfully registered to ${member.displayName}.`);
      registrationResults.push(`Account with Ally Code: ${allyCode} registered to ${member.displayName}.`);
    } catch (error) {
      Logger.error(`Failed to register account with Ally Code: ${allyCode} for ${member.displayName}. Error: ${error}`);
      registrationResults.push(`Failed to register account with Ally Code: ${allyCode} for ${member.displayName}.`);
    }
  }

  return registrationResults;
}
