import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import { authStore } from "../modules/auth/hooks/useAuthStore";

// --- helper: correlation id ---
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:7251";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 30000,
});

// --- Request interceptor ---
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getState().accessToken;

  if (!config.headers) config.headers = new AxiosHeaders();

  config.headers.set("X-Correlation-Id", uuidv4());

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

// --- Refresh queue logic ---
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
let requestQueue: Array<(token: string | null) => void> = [];

function enqueue(cb: (token: string | null) => void) {
  requestQueue.push(cb);
}

function flushQueue(token: string | null) {
  requestQueue.forEach((cb) => cb(token));
  requestQueue = [];
}

async function refreshTokenOnce(): Promise<void> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  const currentRefresh = authStore.getState().refreshToken;

  refreshPromise = (async () => {
    if (!currentRefresh) {
      authStore.clear();
      throw new Error("No refresh token");
    }

    try {
      const res = await api.post("/identity/auth/refresh", {
        refreshToken: currentRefresh,
      });
      const { accessToken, refreshToken, user } = res.data;
      authStore.setTokens(accessToken, refreshToken);
      if (user) authStore.setUser(user);
    } catch (err) {
      authStore.clear();
      throw err;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// --- Response interceptor ---
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as any;
    const status = error.response?.status;
    const url = (original?.url || "").toLowerCase();

    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh");

    if (status === 401 && !isAuthEndpoint) {
      if (original && !original._retry) {
        original._retry = true;

        return new Promise((resolve, reject) => {
          enqueue((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }
            if (!original.headers) original.headers = new AxiosHeaders();
            (original.headers as AxiosHeaders).set("Authorization", `Bearer ${newToken}`);
            resolve(api(original));
          });

          refreshTokenOnce()
            .then(() => flushQueue(authStore.getState().accessToken))
            .catch((err) => {
              flushQueue(null);
              reject(err);
            });
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
