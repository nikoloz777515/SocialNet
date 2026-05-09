const Group = require('../models/group.model');
const Message = require('../models/message.model');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');

// ჯგუფის შექმნა
const createGroup = catchAsync(async (req, res, next) => {
    const { title, public, members } = req.body;
    const allMembers = members ? [...new Set([...members, req.user._id])] : [req.user._id];

    const newGroup = await Group.create({
        title,
        public: public ?? true,
        admin: req.user._id,
        members: allMembers
    });

    res.status(201).json({ status: 'success', data: newGroup });
});

// ჩემი ჯგუფების წამოღება
const getMyGroups = catchAsync(async (req, res, next) => {
    const groups = await Group.find({ members: req.user._id })
        .populate('admin', 'fullname profilePicture')
        .sort('-createdAt');

    res.status(200).json({ status: 'success', results: groups.length, data: groups });
});

// ჯგუფის ძებნა
const findGroup = catchAsync(async (req, res, next) => {
    const { query } = req.query;
    if (!query) return next(new AppError("Search term is required", 400));

    const groups = await Group.find({ 
        title: { $regex: query, $options: 'i' } 
    }).populate('admin members', 'fullname profilePicture');

    res.status(200).json({ status: 'success', data: groups });
});

//ჯგუფში გაწევრიანება
const joinGroup = catchAsync(async (req, res, next) => {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) return next(new AppError("Group not found", 404));

    if (group.members.includes(req.user._id)) {
        return next(new AppError("You are already a member", 400));
    }

    group.members.push(req.user._id);
    await group.save();

    res.status(200).json({ status: 'success', data: group });
});

// ჯგუფის წაშლა
const deleteGroup = catchAsync(async (req, res, next) => {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) return next(new AppError("Group not found", 404));

    if (group.admin.toString() !== req.user._id.toString()) {
        return next(new AppError("Only the group admin can delete this group", 403));
    }

    await Message.deleteMany({ group: groupId });
    await Group.findByIdAndDelete(groupId);

    res.status(204).json({ status: 'success', data: null });
});

module.exports = { createGroup, findGroup, getMyGroups, deleteGroup, joinGroup };