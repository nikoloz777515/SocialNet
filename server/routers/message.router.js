const express = require('express');
const { 
    sendMessage, 
    getMessages, 
    editMessage,   
    deleteMessage  
} = require('../controllers/message.controller');
const protect = require('../middlewares/protect.middleware');
const upload = require('../utils/image');
const messageRouter = express.Router();

messageRouter.use(protect);

// მესიჯის გაგზავნა
messageRouter.post('/', upload.single('messageImage'), sendMessage);


messageRouter.get('/:id', getMessages);

// რედაქტირება და წაშლა
messageRouter.patch('/:messageId', editMessage);
messageRouter.delete('/:messageId', deleteMessage);

module.exports = messageRouter;