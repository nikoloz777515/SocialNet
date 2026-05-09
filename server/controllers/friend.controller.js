const Friendship = require('../models/frienship.model');
const User = require('../models/user.model')
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');

const sendFriendRequest = catchAsync(async (req, res, next) => {
    const receiverId = req.params.userId;
    const senderId = req.user.id;

    if (senderId === receiverId) return next(new AppError("Cannot add yourself", 400));

    const existing = await Friendship.findOne({
        $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId }
        ]
    });

    if (existing) return next(new AppError("Request already exists", 400));

    await Friendship.create({ sender: senderId, receiver: receiverId });
    res.status(200).json({ status: 'success', message: 'Request sent' });
});

const acceptFriendRequest = catchAsync(async (req, res, next) => {
    const friendId = req.params.userId; // ფრონტენდიდან მოდის იუზერის ID
    const friendship = await Friendship.findOneAndUpdate(
        { sender: friendId, receiver: req.user.id, status: 'pending' },
        { status: 'accepted' },
        { new: true }
    );

    if (!friendship) return next(new AppError("Request not found", 404));
    res.status(200).json({ status: 'success', message: 'Friendship accepted' });
});

 const rejectOrCancelRequest = catchAsync(async (req, res, next) => {
    const friendId = req.params.userId;
    await Friendship.findOneAndDelete({
        $or: [
            { sender: req.user.id, receiver: friendId },
            { sender: friendId, receiver: req.user.id }
        ],
        status: 'pending'
    });
    res.status(200).json({ status: 'success', message: 'Action completed' });
});

const unFriend = catchAsync(async (req, res, next) => {
    const friendId = req.params.userId;
    await Friendship.findOneAndDelete({
        $or: [
            { sender: req.user.id, receiver: friendId },
            { sender: friendId, receiver: req.user.id }
        ],
        status: 'accepted'
    });
    res.status(200).json({ status: 'success', message: 'Unfriended' });
});

const getMyFriends = catchAsync(async (req, res, next) => {
    const targetUserId = req.params.userId || req.user.id;

    const friendships = await Friendship.find({
        $or: [{ sender: targetUserId }, { receiver: targetUserId }],
        status: 'accepted'
    }).populate('sender receiver', 'fullname avatar profilePicture');

    const friends = friendships.map(f => {
        const isTargetSender = f.sender._id.toString() === targetUserId.toString();
        return isTargetSender ? f.receiver : f.sender;
    });
    res.status(200).json({ status: 'success', friends });
});

const searchUsers = catchAsync(async (req, res, next) => {
    const { query } = req.query;

    if (!query) {
        return res.status(200).json({ status: 'success', data: [] });
    }

    // ვეძებთ მომხმარებელს სახელით (ქეისის მიმართ მგრძნობელობის გარეშე)
    const users = await User.find({
        fullname: { $regex: query, $options: 'i' },
        _id: { $ne: req.user.id } // საკუთარ თავს რომ არ ვეძებდეთ
    }).select('fullname profilePicture email');

    res.status(200).json({
        status: 'success',
        data: users
    });
});

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password')
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }
        res.status(200).json({ status: 'success', user });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

module.exports = {sendFriendRequest,acceptFriendRequest,rejectOrCancelRequest,unFriend,getMyFriends,searchUsers,getUserById};