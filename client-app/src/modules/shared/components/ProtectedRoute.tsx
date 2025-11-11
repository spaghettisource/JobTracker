import React from "react";
import { Navigate } from "react-router-dom";
import { authStore } from "../../auth/hooks/useAuthStore";
import { useAuthInitializer } from "../../auth/hooks/useAuthInitializer";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: JSX.Element;
  requiredRole?: string;
}) {
  const loading = useAuthInitializer();
  const isAuthenticated = authStore.isAuthenticated();
  const user = authStore.getState().user;

  if (loading) {
    // докато четем от localStorage
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !user?.roles?.includes(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
