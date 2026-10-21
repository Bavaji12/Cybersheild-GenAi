import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("cybershield_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await api.auth.getMe();
          setUser(profile);
        } catch (err) {
          console.warn("Failed to restore session", err);
          logout();
        }
      } else {
        // Pre-set demo user by default so user can explore immediately
        setUser({
          id: 2,
          username: "demouser",
          email: "user@cybershield.ai",
          full_name: "Alex Morgan",
          role: "user",
          mfa_enabled: false
        });
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (username_or_email, password) => {
    const res = await api.auth.login({ username_or_email, password });
    localStorage.setItem("cybershield_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (email, username, password, full_name) => {
    const res = await api.auth.register({ email, username, password, full_name });
    localStorage.setItem("cybershield_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const demoLogin = async (role = "user") => {
    if (role === "admin") {
      return await login("admin@cybershield.ai", "AdminShield2026!");
    } else {
      return await login("user@cybershield.ai", "CyberShield2026!");
    }
  };

  const logout = () => {
    localStorage.removeItem("cybershield_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
