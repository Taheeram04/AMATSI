/*
 * ============================================================================
 * lib/api/client.ts — AMATSI API CLIENT
 * ============================================================================
 */

import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ─── Axios instance ──────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: attach JWT Bearer token ────────────────────────────

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("amatsi_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response interceptor: unified error handling ────────────────────────────

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → clear storage and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("amatsi_token");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export const saveToken = (token: string) =>
  localStorage.setItem("amatsi_token", token);

export const clearToken = () =>
  localStorage.removeItem("amatsi_token");

export const getToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("amatsi_token")
    : null;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (data: { full_name: string; phone_number: string; password: string }) =>
    api.post("/api/auth/signup", data),

  login: async (data: { phone_number: string; password: string }) => {
    const res = await api.post<{ token: string }>("/api/auth/login", data);
    saveToken(res.data.token);
    return res;
  },

  logout: async () => {
    await api.post("/api/auth/logout");
    clearToken();
  },
};

// ─── Farms ────────────────────────────────────────────────────────────────────

export const farmsApi = {
  list: () => api.get("/api/farms"),
  get: (id: string) => api.get(`/api/farms/${id}`),
  create: (data: object) => api.post("/api/farms", data),
  update: (id: string, data: object) => api.put(`/api/farms/${id}`, data),
  delete: (id: string) => api.delete(`/api/farms/${id}`),
};

// ─── Weather & Soil ──────────────────────────────────────────────────────────

export const weatherApi = {
  getWeather: (farmId: string) => api.get(`/api/weather/${farmId}`),
  getSoilMoisture: (farmId: string) => api.get(`/api/soil/${farmId}`),
};

// ─── Recommendations ─────────────────────────────────────────────────────────

export const recommendationsApi = {
  list: (farmId: string) => api.get(`/api/recommendations/${farmId}`),
  generate: (farmId: string) =>
    api.post("/api/recommendations/generate", { farm_id: farmId }),
};

// ─── Alerts / SMS ─────────────────────────────────────────────────────────────

export const alertsApi = {
  send: (farmId: string) =>
    api.post("/api/alerts/send", { farm_id: farmId }),
  history: () => api.get("/api/alerts/history"),
};