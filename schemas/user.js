const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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

// Fix OverwriteModelError
module.exports = mongoose.models.User || mongoose.model('User', userSchema, 'users-chatbot');
