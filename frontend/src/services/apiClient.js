// central axios instance
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true, // include cookies (for refresh token)
});

// token will be set from AuthContext via setAuthHeader
export function setAuthHeader(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
