import { useGetResumes, useDeleteResume } from "../hooks/useResumeUpload";
import Loader from "./Loader";

function ResumeList() {
  const { data, isLoading, error } = useGetResumes();
  const { mutate: deleteResume, isPending: isDeleting } = useDeleteResume();

  if (isLoading) {
    return (
      <div className="mt-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-2xl bg-red-500/10 p-5 text-center text-red-400">
        Failed to load resumes.
      </div>
    );
  }

  const resumes = data?.resumes || [];

  if (resumes.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-slate-800 p-6 text-center shadow-lg">
        <p className="text-slate-400">No resumes uploaded yet. Upload your first resume above!</p>
      </div>
    );
  }

  const handleDelete = (id, fileName) => {
    if (window.confirm(`Delete "${fileName}"?`)) {
      deleteResume(id);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-8 rounded-2xl bg-slate-800 p-6 shadow-lg">
      <h3 className="mb-4 text-xl font-bold text-cyan-400">
        Your Resumes ({resumes.length})
      </h3>

      <div className="space-y-3">
        {resumes.map((resume) => (
          <div
            key={resume._id}
            className="flex items-center justify-between rounded-xl bg-slate-700 p-4"
          >
            <div className="flex-1">
              <p className="font-semibold text-white">{resume.originalFile}</p>
              <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
                <span className="rounded bg-slate-600 px-2 py-0.5 text-xs font-bold uppercase text-cyan-300">
                  {resume.fileType}
                </span>
                <span>{formatDate(resume.createdAt)}</span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(resume._id, resume.originalFile)}
              disabled={isDeleting}
              className="ml-4 rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 transition hover:border-red-500 hover:text-red-400 disabled:opacity-50"
            >
              🗑 Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResumeList;