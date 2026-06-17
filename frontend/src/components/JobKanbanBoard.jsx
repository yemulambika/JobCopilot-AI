import { useState, useCallback, useRef } from "react";
import {
  useGetJobs,
  useCreateJob,
  useUpdateJob,
  useUpdateJobStatus,
  useDeleteJob,
} from "../hooks/useJobTracker";
import Loader from "./Loader";

const STATUSES = [
  { key: "saved", label: "Saved", icon: "💾", color: "border-slate-500/50 bg-slate-500/10" },
  { key: "applied", label: "Applied", icon: "📤", color: "border-blue-500/50 bg-blue-500/10" },
  { key: "interview", label: "Interview", icon: "🎤", color: "border-yellow-500/50 bg-yellow-500/10" },
  { key: "rejected", label: "Rejected", icon: "❌", color: "border-red-500/50 bg-red-500/10" },
  { key: "offer", label: "Offer", icon: "🎉", color: "border-green-500/50 bg-green-500/10" },
];

const STATUS_COLORS = {
  saved: "text-slate-400 border-slate-500/40 bg-slate-500/10",
  applied: "text-blue-400 border-blue-500/40 bg-blue-500/10",
  interview: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  rejected: "text-red-400 border-red-500/40 bg-red-500/10",
  offer: "text-green-400 border-green-500/40 bg-green-500/10",
};

function JobKanbanBoard() {
  const { data, isLoading } = useGetJobs();
  const { mutateAsync: createJob } = useCreateJob();
  const { mutateAsync: updateJob } = useUpdateJob();
  const { mutateAsync: updateJobStatus } = useUpdateJobStatus();
  const { mutateAsync: deleteJob } = useDeleteJob();

  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    source: "",
    status: "saved",
    appliedDate: "",
    notes: "",
  });

  const dragItem = useRef(null);

  const jobs = data?.jobs || [];

  // ─── Group jobs by status ─────────────────────────────
  const grouped = {};
  STATUSES.forEach((s) => (grouped[s.key] = []));
  jobs.forEach((job) => {
    if (grouped[job.status]) grouped[job.status].push(job);
  });

  // ─── Form handlers ────────────────────────────────────
  const openAddForm = (status = "saved") => {
    setEditingJob(null);
    setFormData({ company: "", role: "", source: "", status, appliedDate: "", notes: "" });
    setShowForm(true);
  };

  const openEditForm = (job) => {
    setEditingJob(job);
    setFormData({
      company: job.company,
      role: job.role,
      source: job.source || "",
      status: job.status,
      appliedDate: job.appliedDate ? job.appliedDate.slice(0, 10) : "",
      notes: job.notes || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.role.trim()) return;

    try {
      if (editingJob) {
        await updateJob({
          id: editingJob._id,
          data: {
            ...formData,
            appliedDate: formData.appliedDate || null,
          },
        });
      } else {
        await createJob({
          ...formData,
          appliedDate: formData.appliedDate || null,
        });
      }
      setShowForm(false);
      setEditingJob(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save job");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this job application?")) {
      try {
        await deleteJob(id);
      } catch (err) {
        alert(err.response?.data?.error || "Failed to delete");
      }
    }
  };

  // ─── Drag and Drop ─────────────────────────────────────
  const handleDragStart = useCallback((e, jobId, sourceStatus) => {
    dragItem.current = { id: jobId, from: sourceStatus };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", jobId);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    async (e, targetStatus) => {
      e.preventDefault();
      if (!dragItem.current) return;

      const { id, from } = dragItem.current;
      if (from === targetStatus) return;

      try {
        await updateJobStatus({ id, status: targetStatus });
      } catch (err) {
        console.error("Drop update failed:", err);
      }
      dragItem.current = null;
    },
    [updateJobStatus]
  );

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-cyan-400">Job Tracker</h1>
          <p className="mt-1 text-slate-300">
            Manage your job applications with a visual Kanban board
          </p>
        </div>
        <button
          onClick={() => openAddForm()}
          className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
        >
          + Add Job
        </button>
      </div>

      {/* Total Stats */}
      <div className="flex flex-wrap gap-4">
        {STATUSES.map((s) => (
          <div
            key={s.key}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2"
          >
            <span className="text-sm text-slate-400">
              {s.icon} {s.label}:
            </span>
            <span className="ml-2 font-bold text-white">
              {grouped[s.key]?.length || 0}
            </span>
          </div>
        ))}
        <div className="rounded-xl border border-cyan-700 bg-cyan-900/20 px-4 py-2">
          <span className="text-sm text-cyan-400">📊 Total:</span>
          <span className="ml-2 font-bold text-cyan-400">{jobs.length}</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {STATUSES.map((status) => (
          <div
            key={status.key}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.key)}
            className={`rounded-2xl border ${status.color} p-4 min-h-[300px]`}
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{status.icon}</span>
                <h3 className="font-bold text-white">{status.label}</h3>
                <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                  {grouped[status.key]?.length || 0}
                </span>
              </div>
              <button
                onClick={() => openAddForm(status.key)}
                className="rounded-lg border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:border-cyan-400 hover:text-cyan-400"
              >
                +
              </button>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {grouped[status.key]?.map((job) => (
                <div
                  key={job._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, job._id, job.status)}
                  className="group cursor-grab rounded-xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-500 active:cursor-grabbing"
                >
                  {/* Card Header */}
                  <div className="mb-1 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-bold text-white">{job.company}</h4>
                      <p className="truncate text-sm text-slate-400">{job.role}</p>
                    </div>
                    <span
                      className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[job.status] || ""}`}
                    >
                      {STATUSES.find((s) => s.key === job.status)?.label || job.status}
                    </span>
                  </div>

                  {/* Source & Date */}
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    {job.source && <span>🔗 {job.source}</span>}
                    {job.appliedDate && <span>📅 {formatDate(job.appliedDate)}</span>}
                  </div>

                  {/* Notes Preview */}
                  {job.notes && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                      {job.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => openEditForm(job)}
                      className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:border-cyan-400 hover:text-cyan-400"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:border-red-500 hover:text-red-400"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {grouped[status.key]?.length === 0 && (
                <div
                  className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-700 p-6 text-sm text-slate-500 hover:border-cyan-400/50 hover:text-cyan-400/50"
                  onClick={() => openAddForm(status.key)}
                >
                  + Drop jobs here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Add / Edit Modal ──────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-3xl bg-slate-800 p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-cyan-400">
              {editingJob ? "Edit Job" : "Add Job"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Source
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LinkedIn, Indeed"
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-cyan-400"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.icon} {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Applied Date
                  </label>
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, appliedDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Any notes about this application..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!formData.company.trim() || !formData.role.trim()}
                  className="flex-1 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
                >
                  {editingJob ? "Update Job" : "Add Job"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingJob(null);
                  }}
                  className="rounded-xl border border-slate-600 px-6 py-3 text-slate-300 transition hover:border-slate-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobKanbanBoard;