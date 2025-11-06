import React, { useState } from "react";
import api from "../api/axiosClient";

export default function CreateApplicationPage() {
  const [form, setForm] = useState({
    position: "",
    company: "",
    link: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/application/applications", form);
      console.log("Created:", response.data);
      alert("Application created successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to create application.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="position"
        placeholder="Position"
        value={form.position}
        onChange={handleChange}
      />
      <input
        name="company"
        placeholder="Company"
        value={form.company}
        onChange={handleChange}
      />
      <input
        name="link"
        placeholder="Link"
        value={form.link}
        onChange={handleChange}
      />
      <input
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange}
      />
      <button type="submit">Create Application</button>
    </form>
  );
}
