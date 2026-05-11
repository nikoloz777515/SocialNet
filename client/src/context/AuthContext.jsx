import { useContext, createContext, useState, useEffect } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


const loadUser = async () => {
  try {
    // თუ localStorage-ში იუზერი არ არის, loadUser საერთოდ არ გაუშვა
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      setLoading(false);
      return;
    }

    const res = await fetch(`${API_URL}/me`, { credentials: "include" });
    const data = await res.json();

    if (res.ok && data.user) {
      setUser(data.user);
    } else {
      // თუ სერვერმა 401 დააბრუნა, ლოკალურადაც ვშლით
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
  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }
    
    const userData = data.user || data.data?.user;
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
    return data;
  } catch (err) {
    console.error("Signup error:", err);
    throw err; 
  }
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