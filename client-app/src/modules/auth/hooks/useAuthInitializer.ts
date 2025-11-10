import { useEffect } from "react";
import { authStore } from "./useAuthStore";

export function useAuthInitializer() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    const refresh = localStorage.getItem("refreshToken");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (token && email) {
      authStore.setTokens(token, refresh || undefined);
      authStore.setUser({
        id: userId || "",
        email,
        roles: role ? [role] : [],
      });
    }
  }, []);
}

export {};
