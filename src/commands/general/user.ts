// import { Logger } from '../../logger';
// import { Command } from '../../classes/Commands';

// export default new Command({
//   name: 'user',
//   description: 'Provides user info!',
//   options: [
//     {
//       name: 'user',
//       description: 'The user that you would like to see information about',
//       type: 6,
//       required: true,
//     },
//   ],
//   execute: async ({ interaction }) => {
//     try {
//       Logger.info('Beginning getUserInfo');
//       const result = await getUserInfo(interaction);
//       Logger.info('getUserInfo Completed');
//       return result;
//     } catch (error) {
//       Logger.error(`Error: ${error}`);
//     }
//   },
// });
