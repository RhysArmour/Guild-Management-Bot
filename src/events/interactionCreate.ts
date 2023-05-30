import { CommandInteractionOptionResolver } from "discord.js"
import { client } from "../bot"
import { Event } from "../classes/Event"
import { ExtendedInteraction } from "../interfaces/discord/Command"
import { Logger } from "../logger"

export default new Event('interactionCreate', async (interaction) => {
    // Chat Input Commands
    if(interaction.isCommand()) {
        await interaction.deferReply()
        const command = client.commands.get(interaction.commandName)
        if (!command) return interaction.followUp("You have used a non existing command")

        try {
        Logger.info(`Executing command: ${command.name}`)
        command.execute({
            args: interaction.options as CommandInteractionOptionResolver,
            client,
            interaction: interaction as ExtendedInteraction
        })} catch (error) {
            Logger.error(`Error while executing ${command.name}`)
        }
    }
}) 