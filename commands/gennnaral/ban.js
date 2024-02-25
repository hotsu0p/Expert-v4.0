const Command = require('../../models/Command');

module.exports = class BanCommand extends Command {
  constructor(client, options) {
    super(client, {
      name: 'ban',
      aliases: ['aasdasdasd'],
      description: 'Ban a user from the server',
      category: 'Moderation',
      cooldown:  5,
    });
  }

  async execute(message, args) {
    try {
      const member = message.mentions.members.first();
      if (!member) return message.reply({ content: `💤 | Cannot find that member...` });
      if (member.id === message.author.id) return message.reply({ content: `❌ | You cannot ban yourself!` });
      if (message.member.roles.highest.position < member.roles.highest.position) return message.reply(`❌ | You cannot ban a user who has a higher role than you...`);
      if (!member.bannable) return message.reply(`❌ | I cannot ban that member`);

      // Ban the user
      await member.ban();
      message.channel.send(`${member.user.tag} has been banned.`);
    } catch (error) {
      console.error(error);
      message.reply({ content: "An error occurred while executing the command." });
    }
  }
};