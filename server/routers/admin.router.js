//=============================================ADMIN PANEL========================================================

const express = require('express');
const adminRouter = express.Router();


const protect = require('../middlewares/protect.middleware'); 
const restrictTo = require('../middlewares/restrict.middleware');

const { getAllUsers, deleteUser, banUser, unbanUser } = require('../controllers/admin.controller');


adminRouter.use(protect);


adminRouter.use(restrictTo('admin'));

adminRouter.get('/all-users', getAllUsers);
adminRouter.patch('/ban-user/:id', banUser);
adminRouter.patch('/unban-user/:id', unbanUser);
adminRouter.delete('/delete-user/:id', deleteUser);

module.exports = adminRouter;