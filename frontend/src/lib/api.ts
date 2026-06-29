import axios from 'axios';
import type { Node, Edge } from '@xyflow/react';
import type { BoardSummary, BoardListItem, BoardDetail, ApiCanvasResponse } from '../types/canvas.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
});

let clerkGetToken: (() => Promise<string | null>) | null = null;

// Debug counter for monitoring API usage during development
let requestCount = 0;

export const getApiRequestCount = () => requestCount;

export const resetApiRequestCount = () => {
  requestCount = 0;
};

if (typeof window !== 'undefined') {
  (window as Window & {
    __API_DEBUG__?: {
      getApiRequestCount: () => number;
      resetApiRequestCount: () => void;
    };
  }).__API_DEBUG__ = {
    getApiRequestCount,
    resetApiRequestCount,
  };
}

export const setClerkGetToken = (fn: () => Promise<string | null>) => {
  clerkGetToken = fn;
};

api.interceptors.request.use(async (config) => {
  requestCount += 1;
  console.log(`[API] #${requestCount} ${config.method?.toUpperCase()} ${config.url}`);

  if (clerkGetToken) {
    const token = await clerkGetToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API] success #${requestCount} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log(`[API] error #${requestCount} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.status);
    return Promise.reject(error);
  }
);

export default api;

// --- Board API ---

export const boardsApi = {
  list: () =>
    api.get<{ boards: BoardListItem[] }>('/boards').then((r) => r.data.boards),

  create: (name: string) =>
    api.post<BoardDetail>('/boards', { name }).then((r) => r.data),

  get: (id: string) =>
    api.get<BoardDetail>(`/boards/${id}`).then((r) => r.data),

  saveCanvas: (id: string, nodes: Node[], edges: Edge[]) =>
    api.put(`/boards/${id}/canvas`, { nodes, edges }).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/boards/${id}`).then((r) => r.data),
};

// --- AI API ---
export const aiApi = {
  generate: (prompt: string) =>
    api.post<ApiCanvasResponse>('/ai/generate', { prompt }).then((r) => r.data),

  modify: (prompt: string, contextNodes: Node[], contextEdges: Edge[]) =>
    api.post<ApiCanvasResponse>('/ai/modify', { prompt, context_nodes: contextNodes, context_edges: contextEdges }).then((r) => r.data),
};