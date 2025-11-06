import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authStore } from "../../auth/hooks/useAuthStore";
import api from "../../../api/axiosClient";
import CreateApplicationModal from "../components/CreateApplicationModal";
import NotificationToast from "../../shared/components/NotificationToast";

interface Application {
  id: string;
  position: string;
  company: string;
  link: string;
  notes: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = authStore.getState().user;
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadApps() {
    try {
      const res = await api.get("/application/applications");
      setApps(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApps();
  }, []);

  async function handleLogout() {
    const refreshToken = authStore.getState().refreshToken;
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch {}
    authStore.clear();
    navigate("/login", { replace: true });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this application?")) return;
    try {
      await api.delete(`/application/applications/${id}`);
      setApps(apps.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete application.");
    }
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className="bg-dark text-white p-3"
        style={{ width: 240, display: "flex", flexDirection: "column" }}
      >
        <h4 className="fw-bold mb-4">📋 App Tracker</h4>
        <button
          className="btn btn-outline-light mb-3"
          onClick={() => setShowModal(true)}
        >
          ➕ New Application
        </button>
        <button className="btn btn-outline-danger mt-auto" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main content */}
      <div className="flex-grow-1 p-4 bg-light">
        <h2 className="fw-bold mb-4">
          Welcome{user ? `, ${user.email}` : ""} 👋
        </h2>

        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Applications</h5>
              <small>{apps.length} total</small>
            </div>
            <div className="card-body p-0">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Company</th>
                    <th>Link</th>
                    <th>Notes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {apps.length > 0 ? (
                    apps.map((a) => (
                      <tr key={a.id}>
                        <td>{a.position}</td>
                        <td>{a.company}</td>
                        <td>
                          <a href={a.link} target="_blank" rel="noreferrer">
                            {a.link}
                          </a>
                        </td>
                        <td>{a.notes?.slice(0, 25)}...</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => setSelectedApp(a)}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(a.id)}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No applications yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedApp && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedApp.position} @ {selectedApp.company}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedApp(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Link: </strong>
                  <a href={selectedApp.link} target="_blank" rel="noreferrer">
                    {selectedApp.link}
                  </a>
                </p>
                <p>
                  <strong>Notes:</strong>
                  <br />
                  {selectedApp.notes || "—"}
                </p>
                {selectedApp.createdAt && (
                  <p className="text-muted small">
                    Created at: {new Date(selectedApp.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedApp(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      <CreateApplicationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreated={loadApps}
      />
                <NotificationToast />
    </div>
  );
}
