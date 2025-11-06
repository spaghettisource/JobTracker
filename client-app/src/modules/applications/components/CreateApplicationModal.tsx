import React, { useState } from "react";
import api from "../../../api/axiosClient";

interface Props {
  show: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateApplicationModal({ show, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    position: "",
    company: "",
    link: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/application/applications", form);
      onCreated();
      onClose();
      setForm({ position: "", company: "", link: "", notes: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to create application.");
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Create New Application</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <input
                  name="position"
                  className="form-control"
                  placeholder="Position"
                  value={form.position}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <input
                  name="company"
                  className="form-control"
                  placeholder="Company"
                  value={form.company}
                  onChange={handleChange}
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
              <div className="col-12 text-end">
                <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
