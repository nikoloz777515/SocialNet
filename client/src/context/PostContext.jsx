import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const PostContext = createContext();
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/posts`;

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE_URL, { credentials: "include" });
      if (res.ok) setPosts(data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  //პოსტის დალაიკება
  const toggleLike = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${postId}/like`, {
        method: 'POST',
        credentials: "include"
      });

      const data = await res.json();
      console.log("Like Response:", data);

      if (res.ok) {
        await fetchPosts();
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  //კომენტარის დამატება
  const addComment = async (postId, content) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ content })
      });

      const data = await res.json();
      console.log("Comment Response:", data);

      if (res.ok) {
        await fetchPosts();
        return { success: true };
      } else {
        console.error("Server error:", data.message);
        return { success: false, error: data.message };
      }
    } catch (err) {
      console.error("Comment error:", err);
      return { success: false };
    }
  };
  // პოსტის შექმნა
  const createPost = async (formData) => {
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        credentials: "include",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(prev => [data.data, ...prev]);
        return { success: true };
      }
    } catch (err) {
      return { success: false };
    }
  };

  // პოსტის წაშლა
  const deletePost = async (postId) => {
    if (!window.confirm("წავშალოთ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/${postId}`, {
        method: 'DELETE',
        credentials: "include"
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <PostContext.Provider value={{
      posts, loading, fetchPosts, createPost,
      deletePost, toggleLike, addComment
    }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => useContext(PostContext);