const Command = require('../../models/Command');
const { ChannelType, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const TicketModel = require('../../models/ticketModel');

module.exports = class TicketCommand extends Command {
  constructor(client, options) {
    super(client, {
      name: 'ticket',
      description: 'Create a ticket channel',
      category: 'Ticket',
      cooldown: 5,
    });
  }

  async execute(message, args) {
    try {
      // Retrieve ticket information from MongoDB
      const ticketInfo = await TicketModel.findOne({
        guildId: message.guild.id,
      });

      if (!ticketInfo) {
        return message.channel.send('Ticket information not found. Please set it up using `!setticket`.');
      }


      // Retrieve the category channel
   
      const { categoryId, allowedRoles, closeMessage } = ticketInfo;
      const categoryChannel = message.guild.channels.cache.get(categoryId);
      const channelName = `ticket-${message.author.username.toLowerCase()}`;

      // Create a new text channel
      const createdChannel = await message.guild.channels.create(
        {
          name: channelName,
          type: ChannelType.GuildText,
          parent: categoryId,
        }
      );

      // Set permissions for allowed roles
      const { PermissionFlagsBits } = require('discord.js');

      allowedRoles.forEach((roleId) => {
        const role = message.guild.roles.cache.get(roleId);
        if (role) {
          createdChannel.permissionOverwrites.edit(role, {
            [PermissionFlagsBits.ViewChannel]: true, // With this line
            [PermissionFlagsBits.SendMessages]: true, // And this line
          });
        }
    });
      // Send a message with a button to close the channel
      const closeTicketButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(closeTicketButton);

      const ticketMessage = await createdChannel.send({
        content: closeMessage || 'Welcome to your ticket channel!',
        components: [row],
      });

      console.log('Ticket channel created:', createdChannel);

      // Handle button click
      const filter = (interaction) => interaction.customId === 'close_ticket' && interaction.user.id === message.author.id;

      const collector = ticketMessage.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (interaction) => {
        // Close the ticket channel
        await createdChannel.delete();
        interaction.reply('Ticket closed. The channel has been deleted.');
        collector.stop();
      });

      collector.on('end', () => {
        console.log('Button collector ended');
      });

    } catch (err) {
      console.error(err);
      message.channel.send('Error creating ticket channel. Please check the bot\'s permissions.');
    }
  }
};
