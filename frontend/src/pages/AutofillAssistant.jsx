import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const AutofillAssistant = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    portfolio: "",
    coverLetter: "",
  });
  const [preview, setPreview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showPreview = () => {
    setPreview({ ...formData });
    setConfirmed(false);
  };

  const confirmFill = () => {
    setConfirmed(true);
    alert("✅ Preview confirmed. You may now paste this data into the application form. The system does not auto‑submit.");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Autofill Assistant</h2>
      <p className="text-sm text-slate-600 mb-4">
        Fill in your details below, review a preview, then confirm before using the data.
        This tool never submits forms automatically.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="border p-2 rounded" />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="border p-2 rounded" />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="border p-2 rounded" />
        <input name="linkedin" placeholder="LinkedIn URL" value={formData.linkedin} onChange={handleChange} className="border p-2 rounded" />
        <input name="github" placeholder="GitHub URL" value={formData.github} onChange={handleChange} className="border p-2 rounded" />
        <input name="portfolio" placeholder="Portfolio URL" value={formData.portfolio} onChange={handleChange} className="border p-2 rounded" />
        <div className="col-span-2">
          <textarea name="coverLetter" placeholder="Cover Letter (paste or generate)" value={formData.coverLetter} onChange={handleChange} rows={8} className="border p-2 rounded w-full" />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button onClick={showPreview} className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700">
          👁️ Show Preview
        </button>
        {preview && !confirmed && (
          <button onClick={confirmFill} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            ✅ Confirm & Use
          </button>
        )}
      </div>

      {preview && (
        <div className="mb-4 p-4 rounded border bg-slate-50">
          <h3 className="font-semibold mb-2">Preview</h3>
          <table className="text-sm">
            <tbody>
              {Object.entries(preview).map(([key, val]) => (
                <tr key={key}>
                  <td className="font-medium pr-4 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</td>
                  <td>{val || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {confirmed && (
            <p className="mt-2 text-green-700 font-medium">✅ Confirmed. You can now copy & paste into the application form. No auto‑submit occurs.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AutofillAssistant;