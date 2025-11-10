import React from "react";
import { useAuthInitializer } from "../hooks/useAuthInitializer";

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const loading = useAuthInitializer();



  return <>{children}</>;
}
