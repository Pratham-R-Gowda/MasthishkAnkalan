import api from "./apiClient";

export const fetchInbox = (role) => api.get(`/${role}/inbox`);
export const fetchOutbox = () => api.get("/doctor/outbox");
export const sendMessage = (payload) => api.post("/doctor/outbox/send", payload);
