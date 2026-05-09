const express = require('express');
const postRouter = express.Router();
const { 
    postLike, 
    addComment, 
    deleteComment, 
    editComment,
    deletePost,
    getAllPosts,
    createPost,
    editPost
} = require('../controllers/post.contrtoller');
const protect = require('../middlewares/protect.middleware');
const upload = require('../utils/image')


postRouter.use(protect);

// --- პოსტების მართვა ---
postRouter.get('/', getAllPosts);
postRouter.patch('/:postId', editPost);
postRouter.delete('/:postId', deletePost);

postRouter.post('/', upload.single('postImage'), createPost); 

// --- ლაიქები ---
postRouter.post('/:postId/like', postLike);

// --- კომენტარების მართვა ---
// კომენტარის დამატება
postRouter.post('/:postId/comment', addComment);

// კომენტარის წაშლა 
postRouter.delete('/:postId/comments/:commentId', deleteComment);

// კომენტარის რედაქტირება
postRouter.patch('/:postId/comments/:commentId', editComment);

module.exports = postRouter;