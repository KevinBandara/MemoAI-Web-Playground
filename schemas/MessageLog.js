const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    sequenceNumber: { type: Number, required: true } 
});

module.exports = mongoose.model('MessageLog', messageLogSchema, 'message-logs');