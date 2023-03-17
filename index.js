require('dotenv').config();
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { sequelize } = require('./src/utils/database/sequelize');
const { guildDb } = require('./src/utils/database/guild-db');
const { botDb } = require('./src/utils/database/bot-db');
const {
  ticketStrikeMessage,
  resetMonthlyStrikes,
} = require('./src/services/strike-sorting');
// const { clientId, token } = require('./config/config.json');
const { addThreeStrikeRole } = require('./src/services/move-room');
const { currentDate } = require('./src/utils/helpers/get-date');

const keep_alive = require('./keep_alive')
const token = process.env['token']
const clientId = process.env['clientId']

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

client.once('ready', async () => {
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
  console.info(
    `${message.author.username} sent a message in ${message.guild.name}`,
  );
  const serverId = message.guild.id;
  const strikeRecord = await botDb.findOne({
    where: { Name: 'Strike Channel', ServerId: serverId },
  });

  if (message.author.id === '470635832462540800') {
    console.log('Message is from Hotbot');
    const { day, month } = currentDate();

    const triggerMessage = await botDb.findOne({
      where: { Name: 'Trigger Message', ServerId: message.guild.id },
    });

    const offenseRecord = await botDb.findOne({
      where: { Name: 'Ticket Offense Channel', ServerId: serverId },
    });

    const lastStrikeReset = await botDb.findOne({
      where: { ServerId: serverId, Name: 'LastStrikeReset' },
    });

    if (day === 1 && (!lastStrikeReset || lastStrikeReset.Value != month)) {
      console.log(
        'Day Equals 1 and Last Strike Reset took place last Month. Starting resetMonthly Strikes',
      );
      await resetMonthlyStrikes(strikeRecord, client);
    }

    if (
      message.content.includes(triggerMessage?.Value) &&
      message.channelId.toString() === offenseRecord.UniqueId.toString()
    ) {
      try {
        const strikeChannel = client.channels.cache.find(
          (strikeChannel) => strikeChannel.id === strikeRecord.UniqueId,
        );
        const offenseChannel = client.channels.cache.find(
          (offenseChannel) => offenseChannel.id === offenseRecord.UniqueId,
        );

        offenseChannel.send('Processing Strikes, Please wait');
        const replyMessage = await ticketStrikeMessage(message);
        strikeChannel.send(replyMessage);
      } catch (error) {
        console.log(error);
      }
    }

  }

  if (message.channelId.toString() === strikeRecord?.UniqueId.toString()) {
    const strikeLimit = ':x::x::x:';
    if (message.content.includes(strikeLimit)) {
      addThreeStrikeRole(message);
    }
  }
});

module.exports = {
  client,
};

//end of file

client.login(token);
