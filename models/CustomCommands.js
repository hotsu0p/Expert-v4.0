const mongoose = require('mongoose');

const customCommandSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
    },
    trigger: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    aliases: {
        type: [String],
        default: [],
    },
    parameters: {
        type: [String],
        default: [],
    },
});

const CustomCommandModel = mongoose.model('CustomCommand', customCommandSchema);

module.exports = CustomCommandModel;
