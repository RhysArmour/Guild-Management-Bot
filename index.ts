import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

import fs from 'node:fs';
import path from 'node:path';
import { REST, Routes } from 'discord.js';
import {
  Client,
  Collection,
  GatewayIntentBits,
  Interaction,
  TextChannel,
  DMChannel,
  GuildChannel,
  Events,
} from 'discord.js';
import { GuildUserTable } from './src/utils/database/models/guild-db';
import { GuildBotData } from './src/utils/database/models/bot-db';
import { connectToPostgres } from './src/utils/database/sequelize-init';

const token = process.env.token as string;
const clientId = process.env.clientId as string;
const guildId = process.env.guildId as string;
const ticketIssuerId = process.env.ticketIssuerId as string;

const rest = new REST().setToken(token);

interface CustomClient extends Client {
  commands?: Collection<string, any>;
}

const client: CustomClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.commands = new Collection();

// Commands
const commands: any[] = [];
const commandsPath = path.join(__dirname, './src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  // Grab all the command files from the commands directory you created earlier
  const filePath = path.join(commandsPath, file);
  let command = require(filePath);
  command = command.default;
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

async () => {
  console.log(`Started refreshing ${commands.length} application (/) commands.`);
  try {
    if (process.env.ENV === 'production') {
      const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('Successfully registered commands globally');
    } else {
      console.log('Attempting to update commands locally');
      // The put method is used to fully refresh all commands in the guild with the current set
      const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log('Successfully registered commands locally');
    }
  } catch (error) {
    if (error) console.log(error);
  }
};

console.log('Attempting Connect to Postgres');
connectToPostgres();
GuildUserTable.sync().then(() => console.log('GuildUserTable is ready'));
GuildBotData.sync().then(() => console.log('GuildBotSetup is ready'));

client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user?.tag}`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  console.log(`${interaction.user?.tag} in #${interaction.channel?.name} triggered an interaction.`);

  const command = client.commands?.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

// client.on('messageCreate', async (message) => {
//   const serverId = message.guild?.id;
//   console.log(`${message.author?.username} sent a message in ${message.guild?.name}`);

//   const { triggerPhrase, ticketChannelId, lastStrikeReset, strikeChannelId } = await GuildBotData.findOne({
//     where: { ServerId: serverId },
//   });

//   if (message.author?.id === ticketIssuerId) {
//     console.log('Message is from Hotbot');

//     const { day, month } = currentDate();

//     if (day === 1 && (!lastStrikeReset || lastStrikeReset !== month)) {
//       console.log('Day Equals 1 and Last Strike Reset took place last Month. Starting resetMonthly Strikes');
//       await resetMonthlyStrikes(strikeChannelId, client);
//     }

//     if (
//       message.content.includes(triggerPhrase) &&
//       message.channelId.toString() === ticketChannelId.toString()
//     ) {
//       try {
//         const strikeChannelObj = message.guild.channels.cache.get(strikeChannelId)
//         console.log(strikeChannelObj)
//         const offenseChannelObj = message.guild.channels.cache.get(ticketChannelId)

//         if (!((offenseChannelObj): offenseChannelObj is TextChannel => offenseChannelObj.type === 0)(offenseChannelObj)) return;
//         if (!((strikeChannelObj): strikeChannelObj is TextChannel => strikeChannelObj.type === 0)(strikeChannelObj)) return;

//         offenseChannelObj?.send('Processing Strikes, Please wait');
//         const replyMessage = await ticketStrikeMessage(message);
//         strikeChannelObj?.send(replyMessage);
//       } catch (error) {
//         console.log(error);
//       }
//     }
//   }

//   if (message.channelId.toString() === strikeChannelId?.toString()) {
//     const strikeLimit = ':x::x::x:';
//     if (message.content.includes(strikeLimit)) {
//       addThreeStrikeRole(message);
//     }
//   }
// });

client.login(token);
