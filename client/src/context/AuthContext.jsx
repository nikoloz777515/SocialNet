import { useContext, createContext, useState, useEffect } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  const loadUser = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, { credentials: "include" });
      const data = await res.json();

      
      const userData = data?.data?.user || data?.user;

      if (res.ok && userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Load user error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");
    if (data?.data?.user) setUser(data.data.user);
    return data;
  };

  const login = async (formData) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    const userData = data?.data?.user || data?.user;

    if (userData) {
      setUser(userData);
      return userData;
    }

    throw new Error("server doesn't respond ");
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  };

  useEffect(() => { loadUser(); }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};