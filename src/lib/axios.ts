import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types/api";
import type { LoginResponse } from "@/types/auth";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig;
    if (!original) return Promise.reject(error);

    // Only attempt refresh on 401, and not on auth endpoints themselves
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/login") &&
      !original.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        // Queue requests while a refresh is in progress
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } =
          await api.get<ApiResponse<LoginResponse>>("/auth/refresh");
        const { access_token, user } = data.data;

        useAuthStore.getState().setAuth(user, access_token);

        // Flush queued requests
        refreshQueue.forEach((cb) => { cb(access_token); });
        refreshQueue = [];

        original.headers.Authorization = `Bearer ${access_token}`;
        return api(original);
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
