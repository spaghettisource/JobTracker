import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosClient";
import { authStore } from "../hooks/useAuthStore";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await api.post("/identity/auth/login", { email, password });
      const token = res.data.token;

      // Decode token to extract role, email, userId
      const decoded: any = jwtDecode(token);
      const role =
        decoded["role"] ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      const userId = decoded["sub"];
      const userEmail = decoded["email"];

      // Save to authStore
      authStore.setTokens(token);
      authStore.setUser({ id: userId, email: userEmail, roles: [role] });

      // Also keep in localStorage for refresh persistence
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("userId", userId);

      console.log("✅ Logged in:", { userEmail, role });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  }

  return (
    <div className="container mt-5">
      <h3>Login</h3>
      <form onSubmit={handleLogin}>
        <input
          id="email"
          type="email"
          className="form-control mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          id="password"
          type="password"
          className="form-control mb-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
}
