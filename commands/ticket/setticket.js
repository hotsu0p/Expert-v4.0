const Command = require('../../models/Command');
const TicketModel = require('../../models/ticketModel');

module.exports = class SetTicketCommand extends Command {
  constructor(client, options) {
    super(client, {
      name: 'setticket',
      description: 'Set up ticket information',
      category: 'Ticket',
      cooldown: 5,
    });
  }

  async execute(message, args) {
    try {
      if (args.length < 4) {
        return message.channel.send('Invalid command. Usage: `!setticket categoryID roleID1 roleID2 messageContent`');
      }

      const categoryId = args[0];
      const closeMessage = args[args.length - 1];

      const allowedRoles = args.slice(1, -1).map(roleId => roleId.replace(/<@&|>/g, ''));

      await TicketModel.findOneAndUpdate(
        { guildId: message.guild.id },
        { guildId: message.guild.id, categoryId, allowedRoles, closeMessage },
        { upsert: true }
      );

      message.channel.send('Ticket information has been set.');
    } catch (err) {
      console.error(err);
      message.channel.send('Error setting up ticket information. Please try again.');
    }
  }
};
