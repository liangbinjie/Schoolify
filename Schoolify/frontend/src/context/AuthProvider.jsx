import React, { createContext, useState, useEffect, useContext } from "react";

// Create the context
const AuthContext = createContext();

// Provide the context to children
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user info
  const [loading, setLoading] = useState(true); // Tracks loading status

  // Check for existing token/user on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // Login handler
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
