const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  try {
    let currentUser;


    if (req.isAuthenticated && req.isAuthenticated()) {
      currentUser = req.user;
    } else {

      const token = req.cookies && req.cookies.jwt;

      if (!token) {
        return next(new AppError("We can't identify you. Please login.", 401));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      currentUser = await User.findById(payload.id);
    }

    if (!currentUser) {
      return next(new AppError("User no longer exists", 401));
    }

    if (currentUser.isBanned) {
      if (req.logout) req.logout(() => {}); 
      
      return next(new AppError("თქვენი ანგარიში დაბლოკილია", 403));
    }

    req.user = currentUser; 
    next();
  } catch (err) {
    return next(new AppError("Authentication failed or token expired", 401));
  }
};

module.exports = protect;