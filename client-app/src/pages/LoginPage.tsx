import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { authStore } from "../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.post("/identity/auth/login", { email, password });
      const { accessToken, refreshToken, user } = res.data || {};
      if (!accessToken) throw new Error("No accessToken in response");

      authStore.setTokens(accessToken, refreshToken);
      if (user) authStore.setUser(user);

      navigate("/dashboard");
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message || err?.message || "Login failed";
      setErrorMsg(serverMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "64px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <h2 style={{ marginBottom: 16 }}>Sign in</h2>
      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Username or Email
          <input
            type="text"
            value={email}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        {errorMsg && (
          <div style={{ color: "crimson", marginBottom: 8 }}>{errorMsg}</div>
        )}

        <button type="submit" disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
