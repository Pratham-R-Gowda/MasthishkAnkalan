// frontend/src/services/settingServices.js
import api from "./apiClient";
export const getSettings = (role) => api.get(`/${role}/settings`);
export const setTheme = (role, theme) => api.put(`/${role}/settings`, { theme });
export const clearInbox = (role) => api.post(`/${role}/inbox/clear`);
