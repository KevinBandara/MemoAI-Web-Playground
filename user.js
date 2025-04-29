"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
;
const userSchema = new mongoose_1.default.Schema({
    userID: String,
    premium: {
        default: false,
        type: Boolean
    },
    plan: String,
    expireTime: Number,
    expireTimeReadable: String,
    imagineUses: {
        default: 0,
        type: Number
    }
});
exports.default = mongoose_1.default.model("User", userSchema, "users-chatbot");
