import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "https://ai-resume-backend-1i32.onrender.com/api/bookmarks";

const JobBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [newJob, setNewJob] = useState({ company: "", role: "", url: "", notes: "", tags: "" });

  // Load bookmarks
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("jwt"); // adjust if token stored elsewhere
    fetch(API_BASE, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setBookmarks(data.bookmarks || []));
  }, [user]);

  const handleAdd = async () => {
    const token = localStorage.getItem("jwt");
    const payload = {
      company: newJob.company,
      role: newJob.role,
      url: newJob.url,
      notes: newJob.notes,
      tags: newJob.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const resp = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    setBookmarks((b) => [...b, data.job]);
    setNewJob({ company: "", role: "", url: "", notes: "", tags: "" });
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("jwt");
    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setBookmarks((b) => b.filter((j) => j.id !== id));
  };

  const handleUpdate = async (id, notes, tags) => {
    const token = localStorage.getItem("jwt");
    await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notes, tags: tags.split(",").map((t) => t.trim()) }),
    });
    setBookmarks((b) =>
      b.map((j) => (j.id === id ? { ...j, notes, tags: tags.split(",").map((t) => t.trim()) } : j))
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Saved Jobs</h2>

      {/* Add new job */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          placeholder="Company"
          value={newJob.company}
          onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Role"
          value={newJob.role}
          onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Job URL"
          value={newJob.url}
          onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Tags (comma separated)"
          value={newJob.tags}
          onChange={(e) => setNewJob({ ...newJob, tags: e.target.value })}
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Notes"
          value={newJob.notes}
          onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })}
          className="border p-2 rounded col-span-2"
        />
        <button onClick={handleAdd} className="bg-cyan-600 text-white px-4 py-2 rounded">
          Add Job
        </button>
      </div>

      {/* List bookmarks */}
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Company</th>
            <th className="px-4 py-2 border">Role</th>
            <th className="px-4 py-2 border">URL</th>
            <th className="px-4 py-2 border">Tags</th>
            <th className="px-4 py-2 border">Notes</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookmarks.map((job) => (
            <tr key={job.id}>
              <td className="px-4 py-2 border">{job.company}</td>
              <td className="px-4 py-2 border">{job.role}</td>
              <td className="px-4 py-2 border">
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  Link
                </a>
              </td>
              <td className="px-4 py-2 border">
                <input
                  defaultValue={job.tags.join(", ")}
                  onBlur={(e) => handleUpdate(job.id, job.notes, e.target.value)}
                  className="border p-1 w-full"
                />
              </td>
              <td className="px-4 py-2 border">
                <textarea
                  defaultValue={job.notes}
                  onBlur={(e) => handleUpdate(job.id, e.target.value, job.tags.join(", "))}
                  className="border p-1 w-full"
                />
              </td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => handleDelete(job.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobBookmarks;