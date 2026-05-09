import { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useNavigate, Link } from 'react-router-dom';
import { getAvatarUrl } from "../utils/avatar";

export default function Friends() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [friendships, setFriendships] = useState([]); 
    const { setActiveChat } = useChat();
    const navigate = useNavigate();

    const API_URL = "http://localhost:3000/api";

    const fetchFriendships = async () => {
        try {
            const res = await fetch(`${API_URL}/friend/my-friends`, { credentials: 'include' });
            const data = await res.json();
            
 
            if (data.status === 'success') {
                setFriendships(data.friends || []); 
            }
        } catch (err) { 
            console.error(err); 
            setFriendships([]); 
        }
    };

    useEffect(() => { fetchFriendships(); }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        try {
            const res = await fetch(`${API_URL}/auth/search?query=${searchTerm}`, { credentials: 'include' });
            const data = await res.json();
           
            if (data.status === 'success') setSearchResults(data.data || []);
        } catch (err) { console.error(err); }
    };

    const manageAction = async (userId, action) => {
        try {
            const res = await fetch(`${API_URL}/friend/${action}/${userId}`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status === 'success') {
                fetchFriendships();
                setSearchResults([]);
                setSearchTerm('');
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
            {/* Search Section */}
            <div className="bg-[#1e293b]/50 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4">Find New Friends</h2>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input 
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all">Search</button>
                </form>

                <div className="mt-4 grid grid-cols-1 gap-2">
                    {searchResults.map(u => (
                        <div key={u._id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                            <Link to={`/profile/${u._id}`} className="flex items-center gap-3 group">
                                <img 
                                    src={getAvatarUrl(u.avatar || u.profilePicture)} 
                                    className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-indigo-500 transition-all" 
                                    alt="avatar" 
                                    onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                />
                                <span className="text-white font-medium group-hover:text-indigo-400 transition-colors">{u.fullname}</span>
                            </Link>
                            <button onClick={() => manageAction(u._id, 'send-request')} className="bg-indigo-600 text-xs text-white px-4 py-2 rounded-xl hover:bg-indigo-500 transition-colors">Add Friend</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-indigo-400 uppercase tracking-widest">Your Network</h2>
                    {friendships.length === 0 && <p className="text-gray-500 text-sm italic">No friends found</p>}
                    {friendships.map(f => (
                        <div key={f._id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group">
                            <Link to={`/profile/${f._id}`} className="flex items-center gap-3">
                                <img 
                                    src={getAvatarUrl(f.avatar)} 
                                    className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:scale-110 group-hover:border-purple-500 transition-all" 
                                    alt="friend" 
                                />
                                <span className="text-white font-medium group-hover:text-purple-400 transition-colors">{f.fullname}</span>
                            </Link>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { setActiveChat(f); navigate('/messages'); }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-all"
                                >
                                    <MessageIcon />
                                </button>
                                <button onClick={() => manageAction(f._id, 'remove-friend')} className="text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition-all">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const MessageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-1.816c0-1.107-.893-2.008-1.991-2.008H9.77c-1.098 0-1.991.901-1.991 2.008V4.68" />
    </svg>
);