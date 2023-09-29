import { SlashCommandBuilder } from '@discordjs/builders';
import { Logger } from '../../logger';
import { Command } from '../../classes/Commands';
import prisma from '../../utils/database/prisma';
import { checkStrikes } from '../../methods/check-strike';

export default new Command({
  name: 'checkstrikes',
  description: 'Check strikes for one specific member',
  options: [
    {
      name: 'user1',
      description: 'The user that you would like to see the strikes for.',
      type: 6,
      required: true,
    },
    {
      name: 'user2',
      description: 'The user that you would like to see the strikes for.',
      type: 6,
      required: false,
    },
    {
      name: 'user3',
      description: 'The user that you would like to see the strikes for.',
      type: 6,
      required: false,
    },
    {
      name: 'user4',
      description: 'The user that you would like to see the strikes for.',
      type: 6,
      required: false,
    },
    {
      name: 'user5',
      description: 'The user that you would like to see the strikes for.',
      type: 6,
      required: false,
    },
    {
      name: 'user6',
      description: 'The user that you would like to see the strikes for.',
      type: 6,
      required: false,
    },
    {
      name: 'user7',
      description: 'The user that you would like to see the strikes for.',
      type: 6,
      required: false,
    },
    {
      name: 'user8',
      description: 'The user that you would like to see the strikes for.',
      type: 6,
      required: false,
    },
    {
      name: 'user9',
      description: 'The user that you would like to see the strikes for.',
      type: 6,
      required: false,
    },
    {
      name: 'user10',
      description: 'The user that you would like to see the strikes for.',
      type: 6,
      required: false,
    },
  ],

  execute: async ({ interaction }) => {
    Logger.info('Beggining Check Strike Command');
    try {
      Logger.info('Starting checkStrikes');
      const result = await checkStrikes(interaction);
      return result;
    } catch (error) {
      Logger.error(`Error: ${error}`);
    }
  },
});
