import axios from "axios";

const API_URL = "/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials: any) => api.post("/auth/login", credentials),
  register: (credentials: any) => api.post("/auth/register", credentials),
  getMe: () => api.get("/auth/me"),
};

export const projectService = {
  getAll: () => api.get("/projects"),
  create: (data: any) => api.post("/projects", data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const taskService = {
  getAll: (projectId?: string) => api.get("/tasks", { params: { projectId } }),
  create: (data: any) => api.post("/tasks", data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

export default api;
