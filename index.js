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

/*   const { exec } = require('child_process');
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
  const  */customCommandsModel = require('./models/CustomCommands');

  client.on('messageCreate', async (message) => {
      if (message.guild) {
          const guildId = message.guild.id;
          const messageContent = message.content;
  
          const command = await customCommandsModel.findOne({ guildId, trigger: messageContent });
  
          if (command) {
              message.channel.send(command.content);
          } else {
            return;
          }
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
    const guild = message.guild
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
        command.execute(message, args, guild);
      } else {
        console.error(`Command ${command.name} is missing the execute method.`);
      }
    }
  } catch (error) {
    console.error('Error during message event:', error);
  }
});
const prefix = '!'; // Change this to your desired command prefix



client.on('error', console.error);
client.on('warn', console.warn);

client.login(config.token);
