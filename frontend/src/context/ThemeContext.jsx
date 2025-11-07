// frontend/src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/apiClient";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { user, accessToken } = useAuth();
  const [theme, setTheme] = useState("light");

  // Apply theme immediately when it changes
  const applyTheme = (mode) => {
    const root = document.documentElement;
    if (mode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  };

  // Load theme from backend when user and token exist
  useEffect(() => {
    if (!user || !accessToken) return; // ✅ wait for token
    (async () => {
      try {
        const res = await api.get(`/${user.role}/settings`);
        const mode = res.data?.theme || "light";
        setTheme(mode);
        applyTheme(mode);
      } catch (err) {
        console.warn("Theme load failed:", err.response?.status);
        applyTheme("light");
      }
    })();
  }, [user, accessToken]);

  // Toggle and persist theme
  const toggleTheme = async () => {
    if (!user || !accessToken) return; // ✅ guard again
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    try {
      await api.put(`/${user.role}/settings`, { theme: next });
    } catch (err) {
      console.warn("Theme update failed:", err.response?.status);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
