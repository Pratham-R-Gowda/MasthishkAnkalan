import api from "./apiClient";

export const listTests = () => api.get("/patient/tests");
export const createTest = (metadata) => api.post("/patient/tests", { metadata });
export const getAIResults = () => api.get("/patient/ai-results");
export const getReports = () => api.get("/patient/reports");
export const getInbox = () => api.get("/patient/inbox");
export const getTasks = () => api.get("/patient/tasks");
export const completeTask = (taskId) => api.post(`/patient/tasks/${taskId}/complete`);
