import { useEffect, useState } from "react";
import type { Application } from "../types/Application";
import {
  fetchApplications,
  deleteApplication,
} from "../services/applicationsApi";
import CreateApplicationModal from "../components/CreateApplicationModal";
import EditApplicationModal from "../components/EditApplicationModal";

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"Position" | "Company" | "CreatedAt">("CreatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "danger" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchApplications({
        search,
        page,
        pageSize,
        sortBy,
        sortDirection,
      });
      setApplications(data.items);
      setTotal(data.totalCount);
    } catch (err) {
      console.error("Failed to load:", err);
      setToast({ message: "⚠️ Грешка при зареждане", type: "danger" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, pageSize, sortBy, sortDirection]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      load();
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Изтриване на тази апликация?")) return;
    try {
      await deleteApplication(id);
      setToast({ message: "🗑️ Изтрито успешно!", type: "success" });
      await load();
    } catch {
      setToast({ message: "⚠️ Неуспешно изтриване!", type: "danger" });
    }
  };

  const toggleSort = (field: "Position" | "Company" | "CreatedAt") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Applications</h3>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          ➕ New Application
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`toast align-items-center text-bg-${
            toast.type === "success" ? "success" : "danger"
          } show position-fixed top-0 end-0 m-3`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ zIndex: 1050, minWidth: "250px" }}
        >
          <div className="d-flex">
            <div className="toast-body">{toast.message}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setToast(null)}
            ></button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="🔎 Търси по позиция или фирма..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">Зареждане...</div>
      ) : (
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th onClick={() => toggleSort("Position")} style={{ cursor: "pointer" }}>
                Position {sortBy === "Position" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => toggleSort("Company")} style={{ cursor: "pointer" }}>
                Company {sortBy === "Company" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th>Status</th>
              <th onClick={() => toggleSort("CreatedAt")} style={{ cursor: "pointer" }}>
                Created {sortBy === "CreatedAt" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id}>
                <td>{a.position}</td>
                <td>{a.company}</td>
                <td>
                  <span
                    className={`badge bg-${
                      a.status === "Applied"
                        ? "secondary"
                        : a.status === "Interview"
                        ? "info"
                        : a.status === "Offer"
                        ? "success"
                        : "danger"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => {
                      setSelectedApp(a);
                      setShowEdit(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(a.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(page - 1)}>
                ◀ Prev
              </button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">
                Страница {page} от {totalPages || 1}
              </span>
            </li>
            <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(page + 1)}>
                Next ▶
              </button>
            </li>
          </ul>
        </nav>

        <select
          className="form-select w-auto"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          {[5, 10, 20, 50].map((s) => (
            <option key={s} value={s}>
              {s} / страница
            </option>
          ))}
        </select>
      </div>

      {/* Modals */}
      <CreateApplicationModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
      />
      <EditApplicationModal
        show={showEdit}
        onClose={() => setShowEdit(false)}
        application={selectedApp}
        onUpdated={load}
      />
    </div>
  );
}
