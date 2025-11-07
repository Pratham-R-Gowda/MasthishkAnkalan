// frontend/src/services/apiClient.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Load token on startup so first requests already have it
const stored = localStorage.getItem("access_token");
if (stored) {
  api.defaults.headers.common.Authorization = `Bearer ${stored}`;
  console.log("✅ Loaded auth header on startup");
}

export function setAuthHeader(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("access_token", token);
    console.log("✅ Auth header set: Bearer", token.slice(0, 16) + "...");
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("access_token");
    console.log("❌ Auth header removed");
  }
}

export default api;
