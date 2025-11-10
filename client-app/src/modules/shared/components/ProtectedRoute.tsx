import React from "react";
import { Navigate } from "react-router-dom";
import { authStore } from "../../auth/hooks/useAuthStore";
import { useAuthInitializer } from "../../auth/hooks/useAuthInitializer";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const loading = useAuthInitializer();
  const isAuth = authStore.isAuthenticated();


  return children;
}
