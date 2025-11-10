import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import { loadApplications } from "../applicationsSlice";
import { deleteApplication } from "../services/applicationsApi";
import CreateApplicationModal from "../components/CreateApplicationModal";
import EditApplicationModal from "../components/EditApplicationModal";
import { SortBy, SortDirection } from "../types/Application"; // ✅ import from shared types

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { list: applications, total, loading } = useSelector(
    (state: RootState) => state.applications
  );
  const { role } = useSelector((state: RootState) => state.auth);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.CreatedAt); // ✅ use enum
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirection.Desc
  );

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedApp, setSelectedApp] = useState<number | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "danger" } | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load data from Redux
  useEffect(() => {
    dispatch(
      loadApplications({
        search,
        page,
        pageSize,
        sortBy,
        sortDirection,
      })
    );
  }, [dispatch, search, page, pageSize, sortBy, sortDirection]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Изтриване на тази апликация?")) return;
    try {
      await deleteApplication(id);
      setToast({ message: "🗑️ Изтрито успешно!", type: "success" });
      dispatch(
        loadApplications({
          search,
          page,
          pageSize,
          sortBy,
          sortDirection,
        })
      );
    } catch {
      setToast({ message: "⚠️ Неуспешно изтриване!", type: "danger" });
    }
  };

  // Toggle sort direction or change field
  const toggleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortDirection(
        sortDirection === SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc
      );
    } else {
      setSortBy(field);
      setSortDirection(SortDirection.Asc);
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

      {/* Show HR info banner */}
      {role === "HR" && (
        <div className="alert alert-info mb-3">
          <strong>HR mode:</strong> viewing all applications
        </div>
      )}

      {/* Toast message */}
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

      {/* Search box */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="🔎 Търси по позиция или фирма..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Applications table */}
      {loading ? (
        <div className="text-center py-5">Зареждане...</div>
      ) : (
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th onClick={() => toggleSort(SortBy.Position)} style={{ cursor: "pointer" }}>
                Position {sortBy === SortBy.Position ? (sortDirection === SortDirection.Asc ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => toggleSort(SortBy.Company)} style={{ cursor: "pointer" }}>
                Company {sortBy === SortBy.Company ? (sortDirection === SortDirection.Asc ? "▲" : "▼") : ""}
              </th>
              <th>Status</th>
              <th onClick={() => toggleSort(SortBy.CreatedAt)} style={{ cursor: "pointer" }}>
                Created {sortBy === SortBy.CreatedAt ? (sortDirection === SortDirection.Asc ? "▲" : "▼") : ""}
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
                      setSelectedApp(a.id);
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
        onCreated={() =>
          dispatch(
            loadApplications({
              search,
              page,
              pageSize,
              sortBy,
              sortDirection,
            })
          )
        }
      />
      <EditApplicationModal
  show={showEdit}
  onClose={() => setShowEdit(false)}
  application={applications.find(a => a.id === selectedApp) || null}
  onUpdated={() =>
    dispatch(
      loadApplications({
        search,
        page,
        pageSize,
        sortBy,
        sortDirection,
      })
    )
  }
/>

    </div>
  );
}
