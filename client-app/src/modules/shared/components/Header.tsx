import React from "react";
import { useNavigate } from "react-router-dom";
import { authStore } from "../../auth/hooks/useAuthStore";

export default function Header() {
  const navigate = useNavigate();
  const { user, role } = authStore.getState();

  const handleLogout = () => {
    authStore.clear();
    navigate("/login");
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 className="mb-0">Job Tracker</h4>
        {user && (
          <small className="text-muted">
            {role === "HR" ? "HR Panel" : "Candidate Panel"} – {user.email}
          </small>
        )}
      </div>
      <button className="btn btn-outline-danger" onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );
}
