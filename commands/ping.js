const Command = require('../models/Command');

module.exports = class PingCommand extends Command {
  constructor(client, options) {
    super(client, {
      name: 'ping',
      aliases: ['p'],
      description: 'Ping command',
      category: 'General',
      cooldown:  5,
    });
  }

  execute(message, args) {
    console.log(`Executing ping command for message: ${message.content}`); // Add this line
    message.channel.send('Pong!');
  }
};