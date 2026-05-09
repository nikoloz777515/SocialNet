import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck } from "lucide-react";
import { getAvatarUrl } from "../utils/avatar"; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0f172a]/80 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div onClick={() => navigate("/feed")} className="cursor-pointer group">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-400 bg-clip-text text-transparent group-hover:opacity-80 transition">
            SocialNet
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {!user ? (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-300 hover:text-white font-medium transition">Login</Link>
              <Link to="/signup" className="bg-gradient-to-r from-indigo-500 to-pink-500 px-6 py-2 rounded-xl text-white font-semibold hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-500/20">Sign Up</Link>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6 border-r border-white/10 pr-6">
                
                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-1 text-red-400 hover:text-red-300 font-bold transition">
                    <ShieldCheck size={18} />
                    Admin
                  </Link>
                )}

                <Link to="/feed" className="text-gray-300 hover:text-indigo-400 font-medium transition">Feed</Link>
                <Link to="/groups" className="text-gray-300 hover:text-indigo-400 font-medium transition">Groups</Link>
                <Link to="/friends" className="text-gray-300 hover:text-indigo-400 font-medium transition">Friends</Link>

                <Link to="/messages" className="text-gray-300 hover:text-indigo-400 font-medium transition flex items-center gap-2">
                  Messages
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-3 group px-2 py-1 rounded-2xl hover:bg-white/5 transition">
                  <div className="relative">

                    <img 
                      src={getAvatarUrl(user?.avatar || user?.profilePicture)} 
                      className="w-9 h-9 rounded-full border-2 border-white/10 group-hover:border-indigo-400 transition object-cover"
                      alt="avatar" 
                      onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0f172a] rounded-full"></div>
                  </div>
                  
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-white leading-none">
                      {user?.fullname ? user.fullname.split(' ')[0] : "User"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                       {user?.role === 'admin' ? 'Admin' : 'Member'}
                    </p>
                  </div>
                </Link>

                <button onClick={handleLogout} className="ml-2 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;