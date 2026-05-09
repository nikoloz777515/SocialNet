const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required!"],
        trim: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User"
        }
    ],
    public: {
        type: Boolean,
        default: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Group must have an admin!"] 
    }
}, {
    timestamps: true
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;