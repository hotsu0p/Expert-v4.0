
class Command {
    constructor(client, options) {
      this.client = client;
      this.name = options.name;
      this.aliases = options.aliases || [];
      this.description = options.description || 'No description provided.';
      this.category = options.category || 'General';
      this.cooldown = options.cooldown || 3;
    }
  
    execute(message, args) {
      throw new Error('execute() not implemented for this command.');
    }
  }
  
  module.exports = Command;
  