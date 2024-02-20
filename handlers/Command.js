const fs = require('fs');
const path = require('path');

class CommandHandler {
    constructor(client, prefix) {
        this.client = client;
        this.prefix = prefix;
        this.commands = new Map();
    }

    loadCommands(commandDir) {
        const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));
      
        for (const file of commandFiles) {
          const commandPath = path.join(commandDir, file);
          
          try {
            const Command = require(commandPath);
            const command = new Command(this.client);
      
            this.commands.set(command.name, command);
      
            if (command.aliases) {
              command.aliases.forEach(alias => {
                this.commands.set(alias, command);
              });
            }
            console.log(`Command loaded: ${command.name}`); // Add this line
          } catch (error) {
            console.error(`Error loading command ${file}:`, error);
          }
        }
      }

      handleCommand(message) {
        console.log(`Handling command for message: ${message.content}`); // Add this line
        try {
          if (!message.content.startsWith(this.prefix) || message.author.bot) return;
      
          const args = message.content.slice(this.prefix.length).trim().split(/ +/);
          const commandName = args.shift().toLowerCase();
      
          const command = this.commands.get(commandName) || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
      
          if (command) {
            console.log(`Command found: ${command.name}`); // Add this line
            command.execute(message, args);
          } else {
            console.log(`Command not found: ${commandName}`); // Add this line
          }
        } catch (error) {
          console.error('Error handling command:', error);
          message.reply('There was an error handling the command.');
        }
      }
}

module.exports = CommandHandler;
