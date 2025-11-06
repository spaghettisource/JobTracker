import React from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { authStore } from "../store/authStore";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = authStore.getState().user;

  async function handleLogout() {
    const refreshToken = authStore.getState().refreshToken;
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch {
      // няма страшно, може вече да е невалиден
    }
    authStore.clear();
    navigate("/login", { replace: true });
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: 24 }}>
      <h2>Welcome{user ? `, ${user.email}` : ""} 👋</h2>

      <p style={{ marginTop: 8 }}>
        <Link to="/create">Create new application</Link>
      </p>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 24,
          padding: "8px 16px",
          backgroundColor: "#eee",
          borderRadius: 6,
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
