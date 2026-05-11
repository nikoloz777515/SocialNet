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

    // შეცვლილი ლოგიკა პასუხის სტრუქტურის მიხედვით
    if (res.ok && data.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      setUser(null);
      localStorage.removeItem("user");
    }
  } catch (err) {
    console.error("Load user error:", err);
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
    
    const userData = data?.data?.user || data?.user;
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
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
  if (!res.ok) throw new Error(data.message || "Login failed");

  const userData = data?.data?.user || data?.user;
  if (userData) {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  }
  throw new Error("Server error");
};

const logout = async () => {
    try {
      await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};