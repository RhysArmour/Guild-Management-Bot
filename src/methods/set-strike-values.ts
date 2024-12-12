// import { ServerWithRelations } from '../interfaces/database/server-table-interface';
// import { Logger } from '../logger';

// export const setStrikeValues = async (interaction, server: ServerWithRelations): Promise<string> => {
//   try {
//     Logger.info('Set Strike value command executed');
//     const strikeReason = interaction.options.getString('strike') as string;
//     const value = interaction.options.getInteger('value');

//     const existingValue = server.guildStrikes.find((strike) => strike.strikeReason === strikeReason);

//     if (!existingValue) {
//       await StrikeValuesTableService.createStrikeValuesByInteraction(interaction, { strikeReason, value });
//     } else {
//       await StrikeValuesTableService.updateStrikeValuesByInteraction(interaction, { strikeReason, value });
//     }
//     Logger.info('Strike value added');

//     return 'Strike value updated.';
//   } catch (error) {
//     Logger.error(error);
//     await interaction.reply({
//       content: 'Something went wrong.',
//       ephemeral: true,
//     });
//   }
// };

