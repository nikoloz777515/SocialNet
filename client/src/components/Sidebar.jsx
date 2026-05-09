import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";
import { useChat } from "../context/ChatContext";
import { Plus, Trash2, Users, LogOut, Search, UserPlus } from "lucide-react";
import { getAvatarUrl } from "../utils/avatar";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setActiveChat, searchGroups, searchResults, joinGroup, friends, fetchFriends, activeChat } = useChat();

  const {
    groups,
    fetchGroups,
    createGroup,
    selectGroup,
    deleteGroup, 
  } = useGroup();

  const [newTitle, setNewTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchGroups();
    if (fetchFriends) fetchFriends();
  }, [fetchGroups, fetchFriends]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchGroups(value);
  };

  const handleJoin = async (e, groupId) => {
    e.stopPropagation();
    const success = await joinGroup(groupId);
    if (success) {
      setSearchQuery("");
      fetchGroups(); 
    }
  };

  const handleDeleteGroup = async (e, groupId) => {
    e.stopPropagation();
    if (window.confirm("ნამდვილად გსურთ ჯგუფის წაშლა?")) {
      await deleteGroup(groupId);
     
      if (activeChat?._id === groupId) {
        setActiveChat(null);
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createGroup({ title: newTitle.trim() });
    setNewTitle("");
  };

  const displayGroups = searchQuery.trim().length > 0 ? searchResults : groups;

  return (
    <div className="h-full flex flex-col rounded-[35px] border border-white/10 bg-white/[0.05] backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate(`/profile/${user?._id}`)}>
            <img src={getAvatarUrl(user?.avatar)} className="w-10 h-10 rounded-xl border border-indigo-400/40 object-cover bg-[#1e293b]" alt="user" />
            <div className="overflow-hidden">
              <h2 className="text-white font-bold truncate text-sm">{user?.fullname}</h2>
              <p className="text-gray-400 text-[10px] uppercase font-black tracking-tighter">SocialNet Member</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={16} />
          </button>
        </div>

        <div className="relative mt-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-2 pl-9 outline-none text-xs focus:border-indigo-500 transition-all"
          />
        </div>

        <form onSubmit={handleCreate} className="mt-3">
          <div className="relative">
            <input
              type="text"
              placeholder="New group..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-xl bg-white text-gray-900 p-2 pr-10 outline-none text-xs font-bold"
            />
            <button type="submit" className="absolute top-1/2 right-1 -translate-y-1/2 w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600">
              <Plus size={16} />
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <div>
          <div className="flex items-center gap-2 px-2 mb-2">
            <Users size={14} className="text-indigo-300" />
            <h3 className="text-gray-400 font-semibold text-[10px] uppercase tracking-widest">Groups</h3>
          </div>
          <div className="space-y-2">
            {displayGroups.map((group) => {
              const isJoined = groups.some(g => g._id === group._id);
              return (
                <div
                  key={group._id}
                  onClick={() => { if (isJoined) { selectGroup(group); setActiveChat(group); navigate("/messages"); } }}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group/item ${
                    activeChat?._id === group._id ? "border-indigo-400 bg-indigo-500/10" : "border-white/5 bg-white/[0.03] hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={getAvatarUrl(group.avatar)} className="w-8 h-8 rounded-lg object-cover" alt="" />
                    <h4 className="font-semibold text-white text-xs truncate">{group.title || group.name}</h4>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isJoined && (
                      <button 
                        onClick={(e) => handleDeleteGroup(e, group._id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover/item:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    
                    {!isJoined && (
                      <button 
                        onClick={(e) => handleJoin(e, group._id)} 
                        className="p-2 rounded-lg bg-indigo-500 text-white"
                      >
                        <UserPlus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!searchQuery && (
          <div>
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  onClick={() => { setActiveChat(friend); navigate("/messages"); }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    activeChat?._id === friend._id ? "border-purple-400 bg-purple-500/10" : "border-white/5 bg-white/[0.03] hover:bg-white/10"
                  }`}
                >
                  <img src={getAvatarUrl(friend.avatar)} className="w-8 h-8 rounded-lg object-cover" alt="" />
                  <h4 className="font-semibold text-white text-xs truncate">{friend.fullname}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}