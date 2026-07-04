import axios from "axios";

/**
 * Shared Axios instance. Base URL is the relative "/api" path, which works in
 * both dev (Vite proxy) and production (Nginx reverse proxy).
 */
export const api = axios.create({
  baseURL: "/api",
});

const TOKEN_KEY = "vacations_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Attach the JWT to every request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, drop the stale token and bounce to login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      localStorage.removeItem("vacations_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/** Pull a human-readable message out of an Axios error. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message || error.message || fallback;
  }
  return fallback;
}

/** Absolute URL for a vacation image filename. */
export function imageUrl(filename: string): string {
  return `/api/vacations/images/${filename}`;
}
