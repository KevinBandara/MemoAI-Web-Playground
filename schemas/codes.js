"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
;
const codeSchema = new mongoose_1.default.Schema({
    code: String,
    duration: Number,
    durationReadable: String,
    plan: String
});
exports.default = mongoose_1.default.model('Codes', codeSchema, "premiumcodes");