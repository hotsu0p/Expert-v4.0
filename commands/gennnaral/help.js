const Command = require('../../models/Command');

module.exports = class PingCommand extends Command {
  constructor(client, options) {
    super(client, {
      name: 'say2',
      aliases: ['p'],
      description: 'Ping command',
      category: 'General',
      cooldown:  5,
    });
  }

  execute(message, args, guild ) {
    message.channel.send('not too muuch here rn lol... hopfually more soon!\n\n "wannna add something? go the the git hub repo here https://github.com/hotsu0p/Expert-v4.0"');
    
  }
};