const Command = require('../../models/Command');

module.exports = class PingCommand extends Command {
  constructor(client, options) {
    super(client, {
      name: 'say',
      aliases: ['p'],
      description: 'Ping command',
      category: 'General',
      cooldown:  5,
    });
  }

  execute(message, args) {
    const input = message.content.split(' ').slice(1).join(' ');
    message.channel.send(input);
  }
};