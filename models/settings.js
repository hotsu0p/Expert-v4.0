const { prefix } = require("../config");
const { Schema, model } = require("mongoose");

const guildSettingSchema = new Schema({
  guildID: {
    type: String,
  },
  prefix: {
    type: String,
    default: prefix,
  },
  leaveChannel: { type: String, default: null }, // Add this field
  footer: { type: String, default: "bye" }, // Add this field
});
module.exports = model("guild_settings", guildSettingSchema);