import React, { useState } from "react";
import api from "../api/axiosClient";

export default function CreateApplicationPage() {
  const [form, setForm] = useState({
    position: "",
    company: "",
    link: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/application/applications", form);
      console.log("Created:", response.data);
      alert("Application created successfully!");
      setForm({ position: "", company: "", link: "", notes: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to create application.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "28rem" }}>
        <h3 className="text-center mb-4 fw-bold">Create New Application</h3>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
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
                value={form.notes}
                rows={3}
              />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100">
                Create Application
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
