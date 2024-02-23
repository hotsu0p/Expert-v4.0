// Import necessary modules
const { Client, Intents, GatewayIntentBits  } = require('discord.js');
const mongoose = require('mongoose');
const config = require('./config');
const GuildSettings = require('./models/settings');
const Command = require('./models/Command');
const Dashboard = require('./dashboard/dashboard');
const fs = require('fs');
const path = require('path');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
  ],
});


mongoose.connect(config.mongodbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.config = config;
client.commands = new Map();
const loadCommands = require('./functions/commandloader'); 

client.once('ready', async () => {
  try {
    console.log('Bot is ready!');
    console.log('Fetching members...');
    await loadCommands(client, './commands');
    console.log('Commands loaded successfully.');

    client.user.setActivity(
      'https://github.com/hotsu0p/chaotic',
      { type: 'WATCHING' },
    );

    Dashboard(client);
    console.log('Dashboard initialized.');
  } catch (error) {
    console.error('Error during client ready:', error);
  }
});
const CustomCommandModel = require('./models/CustomCommands');
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  const { content, guild, member } = message;
  const [commandName, ...args] = content.slice(prefix.length).trim().split(/ +/);

  if (!content.startsWith(prefix)) return;

  try {
      // Check if the command exists in the custom commands
      const customCommand = await CustomCommandModel.findOne({
          guildId: guild.id,
          $or: [
              { trigger: commandName.toLowerCase() },
              { aliases: commandName.toLowerCase() },
          ],
      });

      if (customCommand) {
          const response = await executeCustomCommand(customCommand, args, member);
          message.channel.send(response);
          return;
      }

      const command = client.commands.get(commandName.toLowerCase());
      if (!command) return;

      command.execute(message, args);
  } catch (error) {
      console.error('Error handling messageCreate event:', error);
      message.reply('There was an error executing the command!');
  }
});

  const { exec } = require('child_process');
  const { EmbedBuilder } = require('discord.js');

  const pythonScriptPath = './monitor.py'; 
  const userTag = 'hotsu0p';
  const command = `python ${pythonScriptPath} ${userTag} `;
  
  const childProcess = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      return;
    }
    
  });


client.on('guildMemberRemove', async (member) => {
  try {
    const guildId = member.guild.id;
   
    const guildSettings = await GuildSettings.findOne({ guildId });
    const footer = guildSettings.footer;
   
    if (!guildSettings || !guildSettings.leaveChannel) {
      console.error(`Leave channel not configured for guild ID ${guildId}`);
      return;
    }
    
    const leaveChannel = member.guild.channels.cache.get(guildSettings.leaveChannel);


    if (!leaveChannel) {
      console.error(`Leave channel not found for guild ID ${guildId} with ID ${guildSettings.leaveChannel}`);
      return;
    }
    const embed = new EmbedBuilder()
      .setFooter({ text: `${footer}`,})
      .setDescription(`Goodbye, ${member.user.tag}! We'll miss you.`);
    // Send a farewell message to the leave channel
    leaveChannel.send({  embeds: [embed.toJSON()], });

  } catch (error) {
    console.error('Error handling guildMemberRemove event:', error);
  }
});
client.on('messageCreate', (message) => {
  if (message.content.toLowerCase() === '!ticket') {
    const channel = message.guild.channels.create('ticket', {
      name: 'ticket',
      type: 'text',
      permissionOverwrites: [
        {
          id: message.guild.id,
          deny: ['VIEW_CHANNEL'],
        },
        {
          id: message.author.id,
          allow: ['VIEW_CHANNEL'],
        },
      ],
    });

    channel.then((ticketChannel) => {
      message.author.send(`Your ticket has been created in ${ticketChannel}`);
    });
  }
});
client.on('messageCreate', async (message) => {
  try {
    
    let storedSettings = await GuildSettings.findOne({
      guildID: message.guild.id,
    });

    if (!storedSettings) {
      const newSettings = new GuildSettings({
        guildID: message.guild.id,
      });

      await newSettings.save();
      storedSettings = newSettings;
    }

    if (!message.content.startsWith(storedSettings.prefix)) return;

    const args = message.content.slice(storedSettings.prefix.length).trim().split(/ +/g);
    const commandName = args.shift().toLowerCase();
    
    let command = client.commands.get(commandName);

    // If the command was not found by name, try to find it by alias
    if (!command) {
      for (const [name, cmd] of client.commands.entries()) {
        if (cmd.aliases && cmd.aliases.includes(commandName)) {
          command = cmd;
          break;
        }
      }
    }

    if (command) {

      if (typeof command.execute === 'function') {
        command.execute(message, args);
      } else {
        console.error(`Command ${command.name} is missing the execute method.`);
      }
    }
  } catch (error) {
    console.error('Error during message event:', error);
  }
});

  

client.on('error', console.error);
client.on('warn', console.warn);

client.login(config.token);
