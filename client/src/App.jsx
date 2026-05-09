import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; 

import Navbar from "./components/Nav";
import Signup from "./pages/Signup";
import Login from "./pages/Login"; 
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Groups from "./pages/Groups";
import GroupChat from "./pages/GroupChat";
import Messages from "./pages/Message.jsx";
import Friends from "./pages/Friends.jsx";
import AdminPanel from "./pages/AdminPanel";

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/feed" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/feed" />} />

        
          <Route 
            path="/admin" 
            element={
              user && user.role === 'admin' ? (
                <ProtectedRoute><AdminPanel /></ProtectedRoute>
              ) : (
                <Navigate to="/feed" />
              )
            } 
          />

     
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/profile/:userId?" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />

          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages /> 
            </ProtectedRoute>
          } />
          
          <Route path="/groups/:groupId/chat" element={
            <ProtectedRoute>
              <GroupChat />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to={user ? "/feed" : "/login"} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;