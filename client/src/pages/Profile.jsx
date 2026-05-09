import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import { LogOut, Users, MessageSquare, UserPlus, Clock, UserMinus, Edit3, Save, X, Camera } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "../context/ChatContext";
import PostCard from "../components/PostCard";
import { getAvatarUrl } from "../utils/avatar";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, logout, setUser } = useAuth();
  const { posts } = usePost();
  const { setActiveChat } = useChat();
  const navigate = useNavigate();

  const fileInputRef = useRef();
  const coverInputRef = useRef();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendships, setFriendships] = useState([]);
  const [friendStatus, setFriendStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const isMyProfile = !userId || userId === currentUser?._id;


  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const targetId = userId || currentUser?._id;
        if (!targetId) return;

        const userRes = await fetch(`http://localhost:3000/api/friend/user/${targetId}`, { credentials: 'include' });
        const userData = await userRes.json();

        if (userRes.ok) {
          const userObj = userData.user || userData;
          setProfileUser(userObj);
          setFriendStatus(userData.friendshipStatus || 'none');
          setNewName(userObj.fullname || "");
        }


        const friendsRes = await fetch(`http://localhost:3000/api/friend/friends/${targetId}`, { credentials: 'include' });
        const friendsData = await friendsRes.json();

        if (friendsRes.ok) {
     
          setFriendships(friendsData.friends || []);
        }

      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, currentUser]);


  const handleUpdateProfile = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch("http://localhost:3000/api/auth/updateMe", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname: newName }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setProfileUser(data.user);
        setIsEditing(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);

    type === 'profile' ? setUploading(true) : setCoverUploading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/updateMe", {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setProfileUser(data.user);
      }
    } catch (err) { console.error(err); }
    finally { type === 'profile' ? setUploading(false) : setCoverUploading(false); }
  };

  const getCoverUrl = (path) => path ? `http://localhost:3000/uploads/covers/${path}` : null;

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white italic">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-10">

    
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[45px] overflow-hidden mb-10 shadow-2xl">

       
          <div className="relative h-64 group">
            {profileUser?.coverPhoto ? (
              <img src={getCoverUrl(profileUser.coverPhoto)} className="w-full h-full object-cover" alt="cover" />
            ) : (
              <div className="h-full bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30" />
            )}
            {isMyProfile && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => coverInputRef.current.click()} className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-2xl flex items-center gap-2 font-bold cursor-pointer hover:bg-white/20">
                  <Camera size={20} /> {coverUploading ? "Uploading..." : "ბექრაუნდის შეცვლა"}
                </button>
                <input type="file" ref={coverInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" />
              </div>
            )}
          </div>

          <div className="px-8 pb-8 flex flex-col lg:flex-row items-center lg:items-end gap-8 -mt-20">
     
            <div className="relative group z-20">
              <img
                src={getAvatarUrl(profileUser?.avatar)}
                className={`w-44 h-44 rounded-[40px] border-[8px] border-[#0f172a] object-cover shadow-2xl bg-[#1e293b] ${uploading ? 'opacity-50' : ''}`}
                alt="avatar"
              />
              {isMyProfile && (
                <button onClick={() => fileInputRef.current.click()} className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[40px] opacity-0 group-hover:opacity-100 cursor-pointer">
                  <Camera size={32} className="text-white" />
                </button>
              )}
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'profile')} accept="image/*" />
            </div>

            <div className="flex-1 flex flex-col lg:flex-row justify-between items-center gap-6 mb-4 w-full">
              {isEditing ? (
                <div className="flex gap-3 w-full lg:w-auto">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-2xl font-bold outline-none text-white w-full"
                    autoFocus
                  />
                  <button onClick={handleUpdateProfile} className="p-3 bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-all"><Save size={20} /></button>
                  <button onClick={() => setIsEditing(false)} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><X size={20} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter">{profileUser?.fullname}</h1>
                  {isMyProfile && (
                    <button onClick={() => setIsEditing(true)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-indigo-400 cursor-pointer">
                      <Edit3 size={18} />
                    </button>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                {isMyProfile ? (
                  <button onClick={logout} className="bg-red-500/10 text-red-400 px-6 py-3 rounded-2xl border border-red-500/20 font-bold flex items-center gap-2 hover:bg-red-500/20 transition-all cursor-pointer">
                    <LogOut size={18} /> გასვლა
                  </button>
                ) : (
                  <button
                    onClick={() => { setActiveChat(profileUser); navigate('/messages'); }}
                    className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase flex items-center gap-3 transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
                  >
                    <MessageSquare size={22} /> Message
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Posts Timeline */}
          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-black italic uppercase text-indigo-400 tracking-widest">Timeline</h2>
            {posts.filter(p => (p.userId?._id || p.userId) === profileUser?._id).length > 0 ? (
              posts.filter(p => (p.userId?._id || p.userId) === profileUser?._id).map(post => (
                <PostCard key={post._id} post={post} />
              ))
            ) : (
              <div className="text-gray-500 italic p-16 bg-white/5 rounded-[40px] border border-white/5 text-center uppercase font-bold tracking-widest">
                პოსტები არ არის
              </div>
            )}
          </div>

          {/* Sidebar - Connections */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 sticky top-5 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black italic uppercase flex items-center gap-2">
                  <Users className="text-indigo-400" /> Connections
                </h3>
                <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/20">
                  {friendships.length}
                </span>
              </div>

              <div className="space-y-4">
                {friendships.length > 0 ? (
                  friendships.map((friend) => (
                    <div
                      key={friend._id}
                      onClick={() => navigate(`/profile/${friend._id}`)}
                      className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-white/10 group"
                    >
                      <div className="relative">
                        <img
                          src={getAvatarUrl(friend.avatar)}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                          alt={friend.fullname}
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold truncate group-hover:text-indigo-400 transition-colors">{friend.fullname}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Member</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm italic">Connections not found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;