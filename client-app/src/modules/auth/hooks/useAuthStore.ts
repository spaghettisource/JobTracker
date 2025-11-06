// Прост in-memory store + локално запазване на refreshToken (по избор)

export type User = {
    id: string;
    email: string;
    roles?: string[];
  };
  
  type AuthState = {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
  };
  
  type Listener = (state: AuthState) => void;
  
  const STORAGE_KEYS = {
    refreshToken: "app.refreshToken",
    user: "app.user", // по желание
  };
  
  // Инициализация от localStorage (само refreshToken и user; accessToken е in-memory)
  const initialState: AuthState = {
    accessToken: null,
    refreshToken: typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.refreshToken) : null,
    user:
      typeof window !== "undefined" && localStorage.getItem(STORAGE_KEYS.user)
        ? JSON.parse(localStorage.getItem(STORAGE_KEYS.user) as string)
        : null,
  };
  
  let state: AuthState = { ...initialState };
  const listeners: Listener[] = [];
  
  function setState(partial: Partial<AuthState>) {
    state = { ...state, ...partial };
    listeners.forEach((l) => l(state));
  }
  
  export const authStore = {
    // четене
    getState(): AuthState {
      return state;
    },
  
    // абониране (ако искаш да слушаш промени в компоненти)
    subscribe(listener: Listener) {
      listeners.push(listener);
      return () => {
        const idx = listeners.indexOf(listener);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },
  
    // писане
    setTokens(accessToken: string, refreshToken?: string) {
      setState({ accessToken, refreshToken: refreshToken ?? state.refreshToken });
      if (typeof window !== "undefined" && refreshToken) {
        localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
      }
    },
  
    setUser(user: User | null) {
      setState({ user });
      if (typeof window !== "undefined") {
        if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
        else localStorage.removeItem(STORAGE_KEYS.user);
      }
    },
  
    clear() {
      setState({ accessToken: null, refreshToken: null, user: null });
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.refreshToken);
        localStorage.removeItem(STORAGE_KEYS.user);
      }
    },
  
    // удобни помощници
    isAuthenticated(): boolean {
      return !!state.accessToken || !!state.refreshToken;
    },
  };
  