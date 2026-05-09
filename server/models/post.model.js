const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "You have to enter title"]
  },
  content: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  postImage: {
    type: String
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, {
  timestamps: true,
  
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


postSchema.virtual('comments', {
  ref: 'Comment',       
  foreignField: 'post', 
  localField: '_id'     
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;