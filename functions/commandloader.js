// commandLoader.js
const fs = require('fs');
const path = require('path');

function loadCommands(client, commandDir) {
  // Convert the relative path to an absolute path
  const absoluteCommandDir = path.resolve(__dirname, '..' ,commandDir);

  // Check if the command directory exists
  if (!fs.existsSync(absoluteCommandDir)) {
    console.error(`The command directory ${absoluteCommandDir} does not exist.`);
    return;
  }

  const commandFiles = fs.readdirSync(absoluteCommandDir);

  for (const file of commandFiles) {
    const filePath = path.join(absoluteCommandDir, file);

    if (fs.statSync(filePath).isDirectory()) {
      loadCommands(client, filePath);
    } else if (file.endsWith('.js')) {
      try {
        const CommandClass = require(filePath);
        const command = new CommandClass(client);
        client.commands.set(command.name, command);

        if (command.aliases) {
          command.aliases.forEach(alias => {
            client.commands.set(alias, command);
          });
        }
      } catch (error) {
        console.error(`Error loading command from file ${filePath}:`, error);
      }
    }
  }
}

module.exports = loadCommands;
