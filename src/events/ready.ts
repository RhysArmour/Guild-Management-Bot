import { Event } from '../classes/Event';
import { Logger } from '../logger';

export default new Event('ready', () => {
  try {
    Logger.info('Bot is Online');
  } catch (error) {
    Logger.error(`Error in 'ready' event: ${error}`);
  }
});
