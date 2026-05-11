const Message = require('../models/message.model');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');

const sendMessage = catchAsync(async (req, res, next) => {
    const { receiverId, groupId, content } = req.body;
    const senderId = req.user?._id;

    if (!senderId) return next(new AppError("ავტორიზაცია საჭიროა", 401));

    const receiver = (receiverId && receiverId !== "undefined" && receiverId !== "null") ? receiverId : null;
    const group = (groupId && groupId !== "undefined" && groupId !== "null") ? groupId : null;

   const newMessage = await Message.create({
    sender: senderId,
    receiver,
    group,
    content: content || "",
    messageImage: req.file ? req.file.path : null 
});
    const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'fullname username profilePicture avatar');

    const io = req.app.get('socketio');
    if (io) {
        if (group) {
            io.to(group.toString()).emit('message received', populatedMessage);
        } else if (receiver) {
          
            io.to(receiver.toString()).emit('message received', populatedMessage);
            io.to(senderId.toString()).emit('message received', populatedMessage);
        }
    }

    res.status(201).json({ status: 'success', data: populatedMessage });
});

const getMessages = catchAsync(async (req, res, next) => {
    const { id } = req.params; 
    const myId = req.user._id;

    const messages = await Message.find({
        $or: [
            { group: id },
            { sender: myId, receiver: id },
            { sender: id, receiver: myId }
        ]
    })
    .populate('sender', 'fullname username profilePicture avatar')
    .sort('createdAt');

    res.status(200).json({ status: 'success', data: messages });
});

const editMessage = catchAsync(async (req, res, next) => {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findOneAndUpdate(
        { _id: messageId, sender: req.user._id },
        { content, isEdited: true },
        { new: true }
    ).populate('sender', 'fullname username profilePicture avatar');

    if (!message) return next(new AppError("მესიჯი ვერ მოიძებნა ან არ გაქვთ წვდომა", 404));

    const io = req.app.get('socketio');
    if (io) {
        const targetRoom = message.group || message.receiver;
        io.to(targetRoom.toString()).emit('message updated', message);
    }

    res.status(200).json({ status: 'success', data: message });
});

const deleteMessage = catchAsync(async (req, res, next) => {
    const { messageId } = req.params;

    const message = await Message.findOneAndDelete({ 
        _id: messageId, 
        sender: req.user._id 
    });

    if (!message) return next(new AppError("მესიჯი ვერ მოიძებნა", 404));

    const io = req.app.get('socketio');
    if (io) {
        const targetRoom = message.group || message.receiver;
        io.to(targetRoom.toString()).emit('message deleted', messageId);
    }

    res.status(204).json({ status: 'success', data: null });
});
module.exports = { sendMessage, getMessages,editMessage,deleteMessage };