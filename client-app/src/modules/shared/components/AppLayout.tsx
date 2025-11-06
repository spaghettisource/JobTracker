
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { authStore } from "../../auth/hooks/useAuthStore";
import api from "../../../api/axiosClient";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const user = authStore.getState().user;

  async function handleLogout() {
    const refreshToken = authStore.getState().refreshToken;
    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // може вече да е невалиден — не е проблем
    }
    authStore.clear();
    navigate("/login", { replace: true });
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", backgroundColor: "#fafafa" }}>
      {/* Горна лента */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#1e88e5",
          color: "white",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "18px" }}>
          My Microservices App
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>
            Dashboard
          </Link>
          <Link to="/create" style={{ color: "white", textDecoration: "none" }}>
            Create
          </Link>
          {user && (
            <span style={{ opacity: 0.8 }}>Hi, {user.email}</span>
          )}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#1565c0",
              border: "none",
              color: "white",
              padding: "6px 12px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Основно съдържание */}
      <main style={{ padding: "20px" }}>{children}</main>
    </div>
  );
}
