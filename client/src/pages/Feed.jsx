import { useEffect } from "react";
import { usePost } from "../context/PostContext";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import Sidebar from "../components/Sidebar";
import { Flame, Sparkles, RefreshCw } from "lucide-react";

const Feed = () => {
  const { posts, fetchPosts, loading } = usePost();

  useEffect(() => {
    fetchPosts();
  }, []); 

 
  const sortedPosts = posts ? [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

  return (
    <div className="relative min-h-screen bg-[#030712] text-white">
      
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full flex">
        {/* Sidebar */}
        <div className="hidden lg:flex w-[350px] min-h-screen border-r border-white/5 bg-white/[0.01] backdrop-blur-3xl">
          <div className="sticky top-0 h-screen w-full p-8">
             <Sidebar />
          </div>
        </div>

      
        <div className="flex-1">
          <div className="max-w-4xl mx-auto px-6 py-12">
            
           
            <div className="relative overflow-hidden rounded-[45px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-12 mb-16 group shadow-2xl">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase">
                    <Sparkles size={14} /> Global Feed
                  </div>
                  <h1 className="text-6xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/20">
                    NETWORK
                  </h1>
                  <p className="text-gray-400 text-lg max-w-md font-medium leading-snug">
                    Explore digital stories and connect with members worldwide.
                  </p>
                </div>
                <div className="w-24 h-24 rounded-[30px] bg-indigo-500 flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-indigo-500/40">
                  <Flame size={40} className="text-white animate-pulse" />
                </div>
              </div>
            </div>

            <CreatePost />

            {/* Feed Section */}
            <div className="flex items-center justify-between mb-10 mt-20 px-2">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Exploration</h2>
                <span className="h-[2px] w-12 bg-indigo-500"></span>
              </div>
              <button 
                onClick={() => fetchPosts()}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-90"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {loading ? (
              <div className="py-40 text-center">
                <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xs font-black tracking-widest text-gray-500 uppercase">Loading Space...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedPosts.length > 0 ? (
                  sortedPosts.map((post) => (
                    post?._id && <PostCard key={post._id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-32 bg-white/[0.02] rounded-[40px] border border-dashed border-white/10">
                    <p className="text-gray-500 font-bold italic">No signals found in the network.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;