const express = require('express');
const protect = require('../middlewares/protect.middleware');
const friendRouter = express.Router()

const {sendFriendRequest,acceptFriendRequest,rejectOrCancelRequest,unFriend,getMyFriends,searchUsers,getUserById} = require('../controllers/friend.controller')
friendRouter.use(protect);

//საკუტარი მეგობრების სია
friendRouter.get('/my-friends',getMyFriends);

//მეგობრეობის მოთხოვნის გაგზავნა
friendRouter.post('/send-request/:userId', sendFriendRequest);
//მეგობრეობის მოთხოვნის დადასტურება
friendRouter.post('/accept-request/:userId', acceptFriendRequest);
//მეგობრეობის მოთხოვნის უარყოფა
friendRouter.post('/reject-request/:userId', rejectOrCancelRequest);
//მეგობრეობის ამოშლა
friendRouter.post('/remove-friend/:userId', unFriend);
//მეგობრების სახელით ძებნა
friendRouter.get('/search', protect, searchUsers);

friendRouter.get('/user/:id',getUserById)

friendRouter.get('/friends/:userId', getMyFriends);
module.exports = friendRouter;