import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "https://ai-resume-backend-1i32.onrender.com/api/knowledge";

const KnowledgeBase = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    type: "application", // application | coverLetter | email | resume
    content: "",
    metadata: "",
  });

  // Load existing knowledge items
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("jwt");
    fetch(API_BASE, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setItems(data.items || []));
  }, [user]);

  const handleAdd = async () => {
    const token = localStorage.getItem("jwt");
    const payload = {
      type: newItem.type,
      content: newItem.content,
      metadata: newItem.metadata ? JSON.parse(newItem.metadata) : {},
    };
    const resp = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    setItems((prev) => [...prev, data.item]);
    setNewItem({ type: "application", content: "", metadata: "" });
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("jwt");
    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Personal Knowledge Base</h2>

      {/* Add new item */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <select
          value={newItem.type}
          onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="application">Past Application</option>
          <option value="coverLetter">Generated Cover Letter</option>
          <option value="email">Recruiter Email</option>
          <option value="resume">Resume Version</option>
        </select>

        <textarea
          placeholder="Content (e.g., application details, cover letter text, email body, resume)"
          value={newItem.content}
          onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
          rows={6}
          className="border p-2 rounded col-span-2"
        />

        <textarea
          placeholder="Metadata as JSON (optional)"
          value={newItem.metadata}
          onChange={(e) => setNewItem({ ...newItem, metadata: e.target.value })}
          rows={3}
          className="border p-2 rounded col-span-2"
        />

        <button
          onClick={handleAdd}
          className="bg-cyan-600 text-white px-4 py-2 rounded col-span-2"
        >
          Add Item
        </button>
      </div>

      {/* List items */}
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Type</th>
            <th className="px-4 py-2 border">Content</th>
            <th className="px-4 py-2 border">Metadata</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td className="px-4 py-2 border">{it.type}</td>
              <td className="px-4 py-2 border break-words">{it.content}</td>
              <td className="px-4 py-2 border">
                <pre className="text-xs">{JSON.stringify(it.metadata, null, 2)}</pre>
              </td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => handleDelete(it.id)}
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

export default KnowledgeBase;
