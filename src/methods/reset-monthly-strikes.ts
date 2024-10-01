import { MemberTableServices } from '../database/services/member-services';
import { Logger } from '../logger';
import { ServerTableService } from '../database/services/server-services';
import { ServerWithRelations } from '../interfaces/database/server-table-interface';
import { getLastMonthFullDate } from '../utils/helpers/get-date';
import { StrikeValuesTableService } from '../database/services/strike-values-services';
import { APIEmbed } from 'discord.js';

export const resetMonthlyStrikes = async (server: ServerWithRelations) => {
  Logger.info('Starting resetMonthlyStrikes method');

  try {
    Logger.info(`Calling resetAllGuildStrike`);
    await MemberTableServices.resetAllGuildStrikes(server);
    Logger.info(`All strikes set to 0. Calling updateLastStrikeResetEntry`);
    await ServerTableService.updateLastStrikeResetEntry(server);

    return;
  } catch (error) {
    Logger.error(error);
  }
};

export const monthlyStrikeSummary = async (server: ServerWithRelations): Promise<APIEmbed> => {
  // Retrieve strikes for previous month

  let message = '';
  const strikeValues = await StrikeValuesTableService.getAllGuildStrikeValueObjectByServerId(server.serverId);
  const members = await MemberTableServices.getAllMembersDataByServerId(server.serverId);
  for (const member of members) {
    console.log('NAME:', member.name);
    console.log(member.strikeReasons.toString());
    if (!member.strikes || member.strikes < 1) {
      continue;
    }
    message += `- ${member.name}: ${member.strikes} Strikes`;
    member.strikeReasons.forEach((strikeReason) => {
      const reason = strikeValues.find((strike) => strike.strikeReason === strikeReason.reason);
      if (reason) {
        console.log(`<@${member.memberId}>`, reason);
        message += `\n   - ${reason.strikeReason}: ${':x:'.repeat(reason.value)}`;
      }
    });
    message += `\n`;
  }

  if (message === '') {
    message = 'No Strikes last month!';
  }

  return {
    title: `Strike Recap for ${getLastMonthFullDate().toLocaleString('default', { month: 'long' })}`,
    fields: [{ name: '', value: message }],
  };
  // list strikes in embed from most to least
  // Include: Name, Strikes for month, Strike reasons (With Strike values)
};

// WTF IS GOING ON HERE.
// YOU WERE WORKING ON STRIKE RECAPS
// CURRENT PROBLEM: IT IS NOT RETURNING THE CORRECT STRIKE REASONS WHEN THERE ARE MULTIPLE STRIKES FOR THE ONE PERSON
// TESTING BY CHANGING COMPUTER DATE/TIME TO GUILD RESET TIME (19:30)

