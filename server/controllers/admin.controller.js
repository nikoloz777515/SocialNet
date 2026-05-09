const User = require('../models/user.model');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');


const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ status: 'success', results: users.length, data: users });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});

const banUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, {
    new: true,
    runValidators: true
  });

  if (!user) return next(new AppError('No user found with that ID', 404));

  res.status(200).json({ status: 'success', message: 'User has been banned' });
});

const unbanUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, {
    new: true
  });

  if (!user) return next(new AppError('No user found with that ID', 404));

  res.status(200).json({ status: 'success', message: 'User has been unbanned' });
});


module.exports = { getAllUsers, deleteUser,banUser,unbanUser };