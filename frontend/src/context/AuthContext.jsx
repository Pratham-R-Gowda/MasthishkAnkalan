// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api, { setAuthHeader } from "../services/apiClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore token on app load
  useEffect(() => {
    const stored = localStorage.getItem("access_token");
    if (!stored) {
      setLoading(false);
      return;
    }

    // 1️⃣ Apply token immediately
    setAccessToken(stored);
    setAuthHeader(stored);

    // 2️⃣ Slight delay ensures axios header is globally applied
    setTimeout(() => {
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data);
          console.log("✅ User loaded:", res.data);
        })
        .catch((err) => {
          console.warn("❌ Failed to load user:", err.response?.status);
          localStorage.removeItem("access_token");
          setAuthHeader(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    }, 0);
  }, []);

  // 🔐 Login
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const token = res.data.access_token;

    // Save and apply token
    localStorage.setItem("access_token", token);
    setAccessToken(token);
    setAuthHeader(token);
    setUser(res.data.user);

    console.log("✅ Logged in, token set:", token.slice(0, 20) + "...");
    return res;
  };

  // 🚪 Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.warn("Logout failed:", e);
    }
    localStorage.removeItem("access_token");
    setAccessToken(null);
    setAuthHeader(null);
    setUser(null);
  };

  // 🆕 Register
  const register = async (email, password, name, role = "patient", profile = {}) => {
    const res = await api.post("/auth/register", { email, password, name, role, profile });
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
