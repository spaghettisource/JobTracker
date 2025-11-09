import React, { useState, useEffect } from "react";
import api from "../../../api/axiosClient";
import type { Application } from "../types/Application";

interface Props {
  show: boolean;
  onClose: () => void;
  application: Application | null;
  onUpdated: () => void;
}

export default function EditApplicationModal({ show, onClose, application, onUpdated }: Props) {
  const [form, setForm] = useState({
    position: "",
    company: "",
    link: "",
    notes: "",
    status: "Applied",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (application) {
      setForm({
        position: application.position,
        company: application.company,
        link: application.link ?? "",
        notes: application.notes ?? "",
        status: application.status,
      });
    }
  }, [application]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    setLoading(true);
    try {
      await api.put(`/applications/${application.id}`, form);
      onUpdated(); // refresh table
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      alert("❌ Неуспешно обновяване на апликацията.");
    } finally {
      setLoading(false);
    }
  };

  if (!show || !application) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Edit Application</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <input
                    name="position"
                    className="form-control"
                    placeholder="Position"
                    value={form.position}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    name="company"
                    className="form-control"
                    placeholder="Company"
                    value={form.company}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <input
                    name="link"
                    className="form-control"
                    placeholder="Link"
                    value={form.link}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12">
                  <textarea
                    name="notes"
                    className="form-control"
                    placeholder="Notes"
                    rows={3}
                    value={form.notes}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12">
                  <select
                    name="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
