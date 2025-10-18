import React, { createContext, useContext, useState, useEffect } from "react";
import api, { setAuthHeader } from "../services/apiClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // try to refresh on mount (will send refresh cookie if present)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.post("/auth/refresh");
        const token = res.data.access_token;
        setAccessToken(token);
        setAuthHeader(token);
        setUser(res.data.user || null);
      } catch (err) {
        setUser(null);
        setAccessToken(null);
        setAuthHeader(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const token = res.data.access_token;
    setAccessToken(token);
    setAuthHeader(token);
    setUser(res.data.user);
    // refresh cookie is set by server (HttpOnly)
    return res;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // swallow
    }
    setAccessToken(null);
    setAuthHeader(null);
    setUser(null);
  };

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
