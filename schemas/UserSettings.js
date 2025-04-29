"use strict";
const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    modelName: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    useGuildModel: {
        type: Boolean,
        default: false
    }
});


const UserSettings = mongoose.model("UserSettings", userSettingsSchema, "user-settings-chatbot");
module.exports = UserSettings;
