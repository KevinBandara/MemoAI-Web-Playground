"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.premium = void 0;
const tslib_1 = require("tslib");
const user_1 = tslib_1.__importDefault(require("./schemas/user"));

class premium {
    static async userCreate(userID) {
        const check = await user_1.default.create({
            userID: userID,
            premium: false,
            plan: null,
            expireTime: null,
            expireTimeReadable: null,
            imagineUses: 1,
        });
        return check;
    }

    static async checkPE(check, interaction) {
        // If the user's premium has expired, update their status
        if (check.expireTime !== null && check.expireTime <= Date.now()) {
            await user_1.default.updateOne(
                { userID: interaction.user.id },
                {
                    $set: {
                        premium: false,
                        plan: null,
                        expireTime: null,
                        expireTimeReadable: null,
                    },
                }
            );
            check.premium = false;  
        }
        return check.premium; 
    }
}

exports.premium = premium;

