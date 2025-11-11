import { useEffect, useState } from "react";
import { authStore } from "./useAuthStore";

export function useAuthInitializer() {
  const [loading, setLoading] = useState(true);

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

    // маркираме, че сме готови
    setLoading(false);
  }, []);

  return loading;
}
