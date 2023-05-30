import { Event } from "../classes/Event";
import { Logger } from "../logger";

export default new Event('ready', () => {
    Logger.info("Bot is Online")
})