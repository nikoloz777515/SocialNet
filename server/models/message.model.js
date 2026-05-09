const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
  
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false 
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: false
    },
    content: {
        type: String,
        default: ""
    },
    messageImage: { 
        type: String
     },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;