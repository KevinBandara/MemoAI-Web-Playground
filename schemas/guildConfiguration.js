"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const guildConfigSchema = new mongoose_1.default.Schema({
    guildID: String,
    aiChannel: {
        default: "",
        type: String,
    }
});
exports.default = mongoose_1.default.model("GuildConfig", guildConfigSchema, "config");
