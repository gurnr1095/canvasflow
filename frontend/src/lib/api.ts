import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
});

let clerkGetToken: (() => Promise<string | null>) | null = null;

export const setClerkGetToken = (fn: () => Promise<string | null>) => {
  clerkGetToken = fn;
};

api.interceptors.request.use(async (config) => {
  if (clerkGetToken) {
    const token = await clerkGetToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

// --- Board API ---

export const boardsApi = {
  list: () =>
    api.get<{ boards: any[] }>('/boards').then((r) => r.data.boards),

  create: (name: string) =>
    api.post('/boards', { name }).then((r) => r.data),

  get: (id: string) =>
    api.get(`/boards/${id}`).then((r) => r.data),

  saveCanvas: (id: string, nodes: any[], edges: any[]) =>
    api.put(`/boards/${id}/canvas`, { nodes, edges }).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/boards/${id}`).then((r) => r.data),
};

// --- AI API ---
export const aiApi = {
  generate: (prompt: string) =>
    api.post('/ai/generate', { prompt }).then((r) => r.data),
};