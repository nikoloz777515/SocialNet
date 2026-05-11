import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { MessageSquarePlus, Users, MessageCircle } from "lucide-react";
import { getAvatarUrl } from "../utils/avatar";

export default function Messages() {
  const { activeChat, setActiveChat } = useChat();
  const { user: currentUser } = useAuth();

  const [friendships, setFriendships] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const fetchFriendships = async () => {
    try {
      setLoadingFriends(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/friend/my-friends`, {
        credentials: 'include'
      });
      const data = await res.json();

      if (data.status === 'success') {
        setFriendships(data.friends || []);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
      setFriendships([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchFriendships();
  }, [currentUser]);

  const handleStartPrivateChat = (friend) => {
    if (friend) {
      setActiveChat(friend);
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)] max-w-7xl mx-auto overflow-hidden px-4">


      <div className="hidden md:block w-1/3 lg:w-1/4 h-full">
        <Sidebar />
      </div>


      <div className="flex-1 h-full bg-white/[0.02] backdrop-blur-sm rounded-[35px] border border-white/10 overflow-hidden relative shadow-2xl">
        {activeChat ? (
          <Chat />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 text-center p-6">
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <MessageCircle size={40} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white italic uppercase tracking-tighter">Your Messages</p>
              <p className="text-sm text-gray-400 mt-2">აირჩიე მეგობარი სიიდან საუბრის დასაწყებად</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. მარჯვენა პანელი - მეგობრების სია (Direct Messages) */}
      <div className="hidden xl:flex w-72 flex-col gap-4 h-full bg-white/[0.02] backdrop-blur-md rounded-[35px] border border-white/10 p-5 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="text-indigo-400" size={18} />
            <h3 className="text-white font-black uppercase italic text-xs tracking-widest">Direct Messages</h3>
          </div>
          <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-lg text-[10px] font-bold">
            {friendships.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {loadingFriends ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="w-full h-16 bg-white/5 rounded-2xl animate-pulse" />
            ))
          ) : friendships.length > 0 ? (
            friendships.map((f) => (
              <button
                key={f._id}
                onClick={() => handleStartPrivateChat(f)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all group ${activeChat?._id === f._id
                    ? 'bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                    : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={getAvatarUrl(f.avatar)}
                    className="w-11 h-11 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                    alt={f.fullname}
                    onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0f172a] rounded-full shadow-sm"></div>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors leading-none mb-1">
                    {f.fullname}
                  </p>
                  <p className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">Verified Friend</p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center p-8 bg-white/5 rounded-[25px] border border-dashed border-white/10">
              <Users className="mx-auto text-gray-600 mb-2" size={24} />
              <p className="text-[10px] text-gray-500 uppercase font-black italic">No friends found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}