import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authStore } from "../store/authStore";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [isAuth, setIsAuth] = useState(authStore.isAuthenticated());

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setIsAuth(authStore.isAuthenticated());
    });
    return unsubscribe;
  }, []);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
