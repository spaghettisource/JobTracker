import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import { loadApplications } from "../../applications/applicationsSlice";
import { SortBy, SortDirection } from "../../applications/types/Application";
import Header from "../../shared/components/Header";
import { getCachedUsers } from "../../../api/usersApi";

type CachedUser = {
  id: number;
  email: string;
  role: string;
  createdAt: string;
};

export default function HrDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { list: applications, total, loading } = useSelector(
    (state: RootState) => state.applications
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.CreatedAt);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.Desc);
  const [cachedUsers, setCachedUsers] = useState<CachedUser[]>([]);

  // 🔹 Load applications
  useEffect(() => {
    dispatch(loadApplications({ search, page, pageSize, sortBy, sortDirection }));
  }, [dispatch, search, page, pageSize, sortBy, sortDirection]);

  // 🔹 Load cached users
  useEffect(() => {
    getCachedUsers().then(setCachedUsers).catch(console.error);
  }, []);

  const toggleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc);
    } else {
      setSortBy(field);
      setSortDirection(SortDirection.Asc);
    }
  };

  const getUserEmail = (userId: number) => {
    const u = cachedUsers.find((u) => u.id === userId);
    return u ? u.email : "—";
  };

  return (
    <div className="p-4">
      <Header />
      <h3>All Candidate Applications</h3>
      <p className="text-muted">Visible only to HR users</p>

      {loading ? (
        <div className="text-center py-5">Зареждане...</div>
      ) : (
        <table className="table table-striped table-hover mt-3">
          <thead>
            <tr>
              <th onClick={() => toggleSort(SortBy.Position)} style={{ cursor: "pointer" }}>Position</th>
              <th onClick={() => toggleSort(SortBy.Company)} style={{ cursor: "pointer" }}>Company</th>
              <th>Status</th>
              <th>User Email</th>
              <th onClick={() => toggleSort(SortBy.CreatedAt)} style={{ cursor: "pointer" }}>Created</th>
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
                <td>{getUserEmail(a.userId)}</td>
                <td>{new Date(a.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
