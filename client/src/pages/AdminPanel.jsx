import React, { useEffect, useState } from 'react';
import { ShieldAlert, Trash2, UserCheck, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAvatarUrl } from '../utils/avatar';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('${import.meta.env.VITE_API_URL}/api/admin/all-users', {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBanToggle = async (userId, isBanned) => {
    const endpoint = isBanned ? 'unban-user' : 'ban-user';
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/${endpoint}/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, isBanned: !isBanned } : u));
      }
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('დარწმუნებული ხართ, რომ გსურთ იუზერის წაშლა?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/delete-user/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) return <div className="text-white text-center mt-20">იტვირთება...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <ShieldAlert className="text-indigo-500" size={40} />
          <h1 className="text-4xl font-black uppercase italic">Admin Dashboard</h1>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[35px] overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 uppercase text-sm">
              <tr>
                <th className="p-6">მომხმარებელი</th>
                <th className="p-6">როლი</th>
                <th className="p-6">სტატუსი</th>
                <th className="p-6 text-right">მოქმედება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition">
                  <td className="p-6">
                    {/* Link ამატებს გადასვლას პროფილზე */}
                    <Link to={`/profile/${user._id}`} className="flex items-center gap-4 group">
                      <div className="relative shrink-0">
                        <img
                          src={getAvatarUrl(user.avatar || user.profilePicture)}
                          alt={user.fullname}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-white/10 group-hover:border-indigo-500 transition-all"
                          onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
                        />
                      </div>
                      <div>
                        <p className="font-bold group-hover:text-indigo-400 transition-colors">{user.fullname}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-6">
                    {user.isBanned ? (
                      <span className="text-red-500 flex items-center gap-1 text-sm font-bold">
                        <UserX size={16} /> Banned
                      </span>
                    ) : (
                      <span className="text-green-500 flex items-center gap-1 text-sm font-bold">
                        <UserCheck size={16} /> Active
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right space-x-2">
                    <button
                      onClick={() => handleBanToggle(user._id, user.isBanned)}
                      className={`p-3 rounded-xl transition ${user.isBanned ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'}`}
                      title={user.isBanned ? "Unban User" : "Ban User"}
                    >
                      {user.isBanned ? <UserCheck size={20} /> : <UserX size={20} />}
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition"
                      title="Delete User"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;