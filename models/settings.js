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
});

module.exports = model("guild_settings", guildSettingSchema);