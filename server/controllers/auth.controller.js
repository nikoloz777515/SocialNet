const User = require('../models/user.model');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

//რეგისტრაცია
const signUp = catchAsync(async(req,res,next)=>{
  const {fullname,email,password} = req.body;

   if (!fullname || !email || !password) {
    return next(new AppError("Fullname, email and password are required", 400));
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new AppError("Email is already in use", 400));
  }

  const newUser = await User.create({
    fullname,
    email,
    password
  })

  res.status(201).json({
  status: "success",
  message: "User registered successfully.",
  user: { fullname, email, _id: newUser._id },
});




});

//შესვლა ანგარიშზე
const logIn = catchAsync(async(req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }


  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }

  
  if (user.isBanned) {
    return next(new AppError("თქვენი ანგარიში დაბლოკილია ადმინისტრაციის მიერ.", 403));
  }
  // -----------------------------------


  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    return next(new AppError("Incorrect email or password", 401));
  }

  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES 
  });

  res.cookie("jwt", token, { httpOnly: true });

  user.password = undefined;

  res.status(200).json({
    status: "success",
    token,
    user
  });
});

//ანგარიშიდან გამოსვლა
const logout = (req, res, next) => {

  req.logout((err) => {
    if (err) return next(err);

    
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

   
    req.session = null;

    res.status(200).json({ status: 'success' });
  });
};

//მომხმარებელის მონაცემების განახლება
const updateMe = catchAsync(async (req, res, next) => {
    const filteredBody = {};
    if (req.body.fullname) filteredBody.fullname = req.body.fullname;
    
   
    if (req.files && req.files.profile) {
        filteredBody.avatar = req.files.profile[0].path; 
    }

    
    if (req.files && req.files.cover) {
        filteredBody.coverPhoto = req.files.cover[0].path;
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id || req.user.id, 
        filteredBody, 
        { new: true, runValidators: true }
    ).select('-password'); 

    res.status(200).json({
        status: 'success',
        user: updatedUser
    });
});

module.exports = {signUp,logIn,logout,updateMe}

