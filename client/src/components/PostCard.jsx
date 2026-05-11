import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Trash2 } from "lucide-react"; 
import { usePost } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../utils/avatar";



const PostCard = ({ post }) => {
  const { toggleLike, deletePost, addComment } = usePost();
  const { user: currentUser } = useAuth();
 const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);


  const author = post.userId || {};
  const isLiked = post.likes?.includes(currentUser?._id);
  const isOwner = author._id === currentUser?._id;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const result = await addComment(post._id, commentText);
    if (result) setCommentText("");
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-md rounded-[35px] p-7 border border-white/10 mb-8 transition-all hover:bg-white/[0.05] group">

      {/* Post Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Link to={`/profile/${author._id}`} className="relative shrink-0">
            <img
              src={getAvatarUrl(author.avatar || author.profilePicture)}
              alt={author.fullname}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-indigo-500/30 group-hover:border-indigo-500 transition-all shadow-lg"
              onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
            />
          </Link>
          <div>
            <Link to={`/profile/${author._id}`} className="font-bold text-white text-lg hover:text-indigo-400 transition-colors">
              {author.fullname || "Anonymous User"}
            </Link>
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "ახლახანს"}
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => { if (window.confirm("ნამდვილად გსურთ პოსტის წაშლა?")) deletePost(post._id) }}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="mb-6 px-1">
        {post.title && <h2 className="text-2xl font-black text-white mb-3 italic tracking-tight uppercase leading-tight">{post.title}</h2>}

        {post.postImage && (
          <div className="mb-4 rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-black/20">
            <img
              src={`${API_URL}/uploads/posts/${post.postImage}`}
              alt="Post content"
              className="w-full h-auto max-h-[550px] object-cover hover:scale-[1.01] transition-transform duration-500"
              loading="lazy"
              onError={(e) => { e.target.closest('.rounded-3xl').style.display = 'none'; }}
            />
          </div>
        )}

        <p className="text-gray-300 leading-relaxed text-lg font-medium whitespace-pre-wrap">{post.content}</p>
      </div>


      <div className="flex items-center justify-between pt-5 border-t border-white/5">
        <div className="flex gap-3">
          <button
            onClick={() => toggleLike(post._id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all font-bold border ${isLiked ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 border-white/5'}`}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            <span>{post.likes?.length || 0}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all font-bold border ${showComments ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 border-white/5'}`}
          >
            <MessageCircle size={20} />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-6 pt-6 border-t border-white/5 space-y-5">
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {post.comments?.map((comment, index) => {
              const commentAuthor = comment.userId || comment.user || {};
              return (
                <div key={index} className="flex gap-3 items-start">
                  <Link to={`/profile/${commentAuthor._id}`} className="shrink-0">
                    <img
                      src={getAvatarUrl(commentAuthor.avatar || commentAuthor.profilePicture)}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-md"
                      alt="avatar"
                      onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
                    />
                  </Link>
                  <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 flex-1 shadow-inner text-left">
                    <Link to={`/profile/${commentAuthor._id}`} className="text-sm font-black text-indigo-400 hover:text-indigo-300">
                      {commentAuthor.fullname || "User"}
                    </Link>
                    <p className="text-gray-200 text-sm mt-1 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleCommentSubmit} className="relative mt-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="დაწერე კომენტარი..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;