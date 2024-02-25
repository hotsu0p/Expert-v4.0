const { Schema, model } = require("mongoose");

const TicketSchema = new Schema({
  guildId: String,
  categoryId: String,
  allowedRoles: [String],
  closeMessage: String,
});

const TicketModel = model("Ticket", TicketSchema);

module.exports = TicketModel;
