const Friendship = require('../models/frienship.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');

// 1. მეგობრობის მოთხოვნის გაგზავნა
const sendFriendRequest = catchAsync(async (req, res, next) => {
    const receiverId = req.params.userId;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
        return next(new AppError("საკუთარ თავს მეგობრობას ვერ გაუგზავნით", 400));
    }

    const existing = await Friendship.findOne({
        $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId }
        ]
    });

    if (existing) {
        return next(new AppError("მოთხოვნა უკვე არსებობს", 400));
    }

    await Friendship.create({ 
        sender: senderId, 
        receiver: receiverId, 
        status: 'pending' 
    });

    res.status(200).json({ 
        status: 'success', 
        message: 'Request sent' 
    });
});

// 2. მეგობრობის მოთხოვნის დადასტურება
const acceptFriendRequest = catchAsync(async (req, res, next) => {
    const friendId = req.params.userId; 
    const friendship = await Friendship.findOneAndUpdate(
        { sender: friendId, receiver: req.user._id, status: 'pending' }, 
        { status: 'accepted' },
        { new: true }
    );

    if (!friendship) return next(new AppError("მოთხოვნა ვერ მოიძებნა", 404));
    res.status(200).json({ status: 'success', message: 'Friendship accepted' });
});

// 3. მოთხოვნის უარყოფა ან გაუქმება (Pending სტატუსის დროს)
const rejectOrCancelRequest = catchAsync(async (req, res, next) => {
    const friendId = req.params.userId;
    const userId = req.user._id; 

    await Friendship.findOneAndDelete({
        $or: [
            { sender: userId, receiver: friendId },
            { sender: friendId, receiver: userId }
        ],
        status: 'pending'
    });
    
    res.status(200).json({ status: 'success', message: 'Action completed' });
});

// 4. მეგობრობის გაუქმება (Accepted სტატუსის დროს)
const unFriend = catchAsync(async (req, res, next) => {
    const friendId = req.params.userId;
    const userId = req.user._id;

    await Friendship.findOneAndDelete({
        $or: [
            { sender: userId, receiver: friendId },
            { sender: friendId, receiver: userId }
        ],
        status: 'accepted'
    });
    res.status(200).json({ status: 'success', message: 'Unfriended' });
});

// 5. მეგობრების სიის წამოღება
const getMyFriends = catchAsync(async (req, res, next) => {
    const targetUserId = req.params.userId || req.user._id;

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

// 6. იუზერის წამოღება სტატუსთან ერთად (ეს აგვარებს Profile-ზე ღილაკების ბაგს)
const getUserById = catchAsync(async (req, res, next) => {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const user = await User.findById(targetUserId).select('-password');
    if (!user) return next(new AppError('მომხმარებელი ვერ მოიძებნა', 404));

    // ვამოწმებთ მეგობრობის სტატუსს ამ ორ ადამიანს შორის
    const friendship = await Friendship.findOne({
        $or: [
            { sender: currentUserId, receiver: targetUserId },
            { sender: targetUserId, receiver: currentUserId }
        ]
    });

    let friendshipStatus = 'none';
    if (friendship) {
        if (friendship.status === 'accepted') {
            friendshipStatus = 'friends';
        } else if (friendship.status === 'pending') {
            friendshipStatus = friendship.sender.toString() === currentUserId.toString() 
                ? 'pending' 
                : 'requested';
        }
    }

    res.status(200).json({ 
        status: 'success', 
        user, 
        friendshipStatus 
    });
});

// 7. ძებნა
const searchUsers = catchAsync(async (req, res, next) => {
    const { query } = req.query;
    if (!query) return res.status(200).json({ status: 'success', users: [] });

    const users = await User.find({
        fullname: { $regex: query, $options: 'i' },
        _id: { $ne: req.user._id }
    }).select('fullname avatar profilePicture email');

    res.status(200).json({ status: 'success', users });
});

// 8. შემოსული მოთხოვნების წამოღება
const getFriendRequests = catchAsync(async (req, res, next) => {
    const requests = await Friendship.find({
        receiver: req.user._id,
        status: 'pending'
    }).populate('sender', 'fullname avatar profilePicture email');

    res.status(200).json({
        status: 'success',
        results: requests.length,
        requests
    });
});

module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    rejectOrCancelRequest,
    unFriend,
    getMyFriends,
    searchUsers,
    getUserById,
    getFriendRequests
};