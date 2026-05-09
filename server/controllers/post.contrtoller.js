const Post = require('../models/post.model');
const Comment = require('../models/comment.model'); 
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');

//  ყველა პოსტის წამოღება კომენტარებთან ერთად
const getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find()
    .populate('userId', 'fullname profilePicture')
    .populate({
      path: 'comments', 
      populate: { path: 'user', select: 'fullname profilePicture' }
    })
    .sort('-createdAt');

  res.status(200).json({ status: 'success', results: posts.length, data: posts });
});

//  პოსტის შექმნა
const createPost = catchAsync(async (req, res, next) => {
  const { title, content } = req.body;

  const newPost = await Post.create({
    title,
    content,
    // აი აქ დაამატე ფაილის სახელი:
    postImage: req.file ? req.file.filename : null, 
    userId: req.user._id
  });

  const populatedPost = await newPost.populate('userId', 'fullname profilePicture');
  res.status(201).json({ status: 'success', data: populatedPost });
});

//  პოსტის დაედიტება
const editPost = catchAsync(async (req, res, next) => {
  const { title, content } = req.body;
  const post = await Post.findById(req.params.postId);

  if (!post) return next(new AppError("Post not found", 404));

  if (post.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only edit your own posts", 403));
  }

  post.title = title || post.title;
  post.content = content || post.content;
  
  await post.save();

  const updatedPost = await post.populate('userId', 'fullname profilePicture');

  res.status(200).json({ status: 'success', data: updatedPost });
});


const postLike = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const isLiked = post.likes.includes(req.user._id);

  if (isLiked) {
    await Post.findByIdAndUpdate(req.params.postId, { $pull: { likes: req.user._id } });
  } else {
    await Post.findByIdAndUpdate(req.params.postId, { $addToSet: { likes: req.user._id } });
  }

  res.status(200).json({ status: 'success', message: isLiked ? "Unliked" : "Liked" });
});

//  კომენტარის დამატება პოსტებზე
const addComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.create({
    post: req.params.postId,
    user: req.user._id,
    content: req.body.content
  });

  await Post.findByIdAndUpdate(req.params.postId, {
    $push: { comments: comment._id }
  });

  res.status(201).json({ status: 'success', data: comment });
});

//  კომენტარის წაშლა
const deleteComment = catchAsync(async (req, res, next) => {
  const { postId, commentId } = req.params;
  
  const comment = await Comment.findById(commentId);
  if (!comment) return next(new AppError("Comment not found", 404));

  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError("You can only delete your own comments", 403));
  }

  await Comment.findByIdAndDelete(commentId);
  
  await Post.findByIdAndUpdate(postId, {
    $pull: { comments: commentId }
  });

  res.status(200).json({ status: 'success', message: 'Comment deleted' });
});

//  კომენტარის დაედიტება
const editComment = catchAsync(async (req, res, next) => {
  const { postId, commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) return next(new AppError("Comment not found", 404));
  if (comment.user.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only edit your own comments", 403));
  }

  comment.content = content;
  await comment.save();

  const populatedPost = await Post.findById(postId).populate({
      path: 'comments',
      populate: { path: 'user', select: 'fullname' }
  });

  res.status(200).json({ status: 'success', data: populatedPost });
});

//  პოსტის წაშლა
const deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);

  if (!post) return res.status(404).json({ message: "Post not found" });

  if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: "თქვენ არ გაქვთ ამ პოსტის წაშლის უფლება" });
  }

  await Post.findByIdAndDelete(req.params.postId);
  await Comment.deleteMany({ post: req.params.postId });

  res.status(200).json({ status: 'success', message: "პოსტი წაიშალა" });
});


const getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.postId)
    .populate('userId', 'fullname profilePicture')
    .populate({
      path: 'comments',
      populate: { path: 'user', select: 'fullname profilePicture' }
    });

  if (!post) return next(new AppError("Post not found", 404));

  res.status(200).json({ status: 'success', data: post });
});

// მომხმარებლის საკუთარი პოსტების წამოღება
const getMyPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ userId: req.user._id })
    .populate('userId', 'fullname')
    .sort('-createdAt');

  res.status(200).json({ status: 'success', data: posts });
});

module.exports = { 
  getAllPosts, 
  postLike, 
  addComment, 
  deleteComment, 
  editComment, 
  deletePost, 
  createPost, 
  editPost, 
  getPost, 
  getMyPosts 
};