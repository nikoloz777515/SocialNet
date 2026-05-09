const express = require('express');
const passport = require('passport'); 
const protect = require('../middlewares/protect.middleware');
const { signUp, logIn, logout, updateMe } = require('../controllers/auth.controller');
const { searchUsers } = require('../controllers/friend.controller');
const upload = require('../utils/image'); // 

const authRouter = express.Router();

authRouter.get('/me', protect, (req, res) => {
  const user = { ...req.user._doc };
  delete user.password;
  res.status(200).json({ status: 'success', user });
});

authRouter.post('/signup', signUp);
authRouter.post('/login', logIn);
authRouter.post('/logout', logout);

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true 
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL); 
  }
);

authRouter.get('/search', protect, searchUsers);

authRouter.patch('/updateMe', protect, upload.fields([
  { name: 'profile', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), updateMe);


module.exports = authRouter;