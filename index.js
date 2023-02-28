require('dotenv').config();
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { sequelize } = require('./src/utils/database/sequelize');
const { guildDb } = require('./src/utils/database/guild-db');
const { botDb } = require('./src/utils/database/bot-db');
const { strikeMessage } = require('./src/services/strike-sorting');
const { clientId, token } = require('./config/config.json');
const { addThreeStrikeRole } = require('./src/services/move-room');

// const keep_alive = require('./keep_alive')
// const token = process.env['token']
// const clientId = process.env['clientId']


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

sequelize.sync().then(() => console.log('database is ready'));
guildDb.sync().then(() => console.log('guildDb is ready'));
botDb.sync().then(() => console.log('botDb is ready'));

// Commands
const commandFiles = fs
  .readdirSync('./src/commands')
  .filter((file) => file.endsWith('.js'));

const commands = [];

client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);
  // Set a new item in the Collection
  commands.push(command.data.toJSON());
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '9' }).setToken(token);

  const deployCommands = async () => {
    try {
      if (process.env.ENV === 'production') {
        await rest.put(Routes.applicationCommand(clientId)),
        {
          body: commands,
        };
        console.log('successfully registered commands globally');
      } else {
        await rest.put(Routes.applicationCommands(clientId), {
          body: commands,
        });
        console.log('successfully registered commands Globally');
      }
    } catch (error) {
      if (error) console.log(error);
    }
  };
  deployCommands();
});

// Command Alert
client.on('interactionCreate', (interaction) => {
  console.log(
    `${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`,
  );
});

// Command
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

// Message Response
client.on('messageCreate', async (message) => {
  const serverId = message.guild.id
  console.log(message.author.id)

  const triggerMessage = await botDb.findOne({ where: { Name: 'Trigger Message', ServerId: message.guild.id } })
  
  const strikeRecord = await botDb.findOne({
    where: { Name: 'Strike Channel', ServerId: serverId },
  });
  
  console.log('PRE IF STATMENT FOR TRIGGER')
  
  if (message.content.includes(triggerMessage?.Value)) {
    
    console.log('IN IF STATEMENT FOR TRIGGER')

    const offenseRecord = await botDb.findOne({
      where: { Name: 'Ticket Offense Channel', ServerId: serverId },
    });

    if (message.channel.id !== offenseRecord.UniqueId && offenseRecord.UniqueId === null) {
      message.reply('You must set Offense Channel and Strike Channel before issuing strikes')
    } else if (message.channel.id !== offenseRecord.UniqueId) {
      return;
    }
    try {
      const strikeChannel = client.channels.cache.find(
        (strikeChannel) => strikeChannel.id === strikeRecord.UniqueId,
      );
      const offenseChannel = client.channels.cache.find(
        (offenseChannel) => offenseChannel.id === offenseRecord.UniqueId,
      );
      offenseChannel.send('Processing Strikes, Please wait');
      const replyMessage = await strikeMessage(message);
      strikeChannel.send(replyMessage);
      return;
    } catch (error) {
      console.log(error);
    }
  }
  if (message.channel.id === strikeRecord?.UniqueId) {
    const strikeLimit = ':x::x::x:'
    if (message.content.includes(strikeLimit)) {
      addThreeStrikeRole(message)
    }
  }
});

//end of file

client.login(token);
