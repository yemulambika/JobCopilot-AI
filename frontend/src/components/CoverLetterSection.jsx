import { useState } from "react";
import { useGenerateCoverLetter, useGetCoverLetters, useDeleteCoverLetter } from "../hooks/useCoverLetters";
import { useGetResumes } from "../hooks/useResumeUpload";
import CoverLetterResult from "./CoverLetterResult";
import Loader from "./Loader";

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
];

function CoverLetterSection() {
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState(null);

  const { mutateAsync: generate, isPending, error: genError } = useGenerateCoverLetter();
  const { data: resumesData } = useGetResumes();
  const { data: historyData, isLoading: historyLoading } = useGetCoverLetters();
  const { mutate: deleteCoverLetter, isPending: isDeleting } = useDeleteCoverLetter();

  const resumes = resumesData?.resumes || [];
  const history = historyData?.coverLetters || [];

  const handleGenerate = async () => {
    if (!resumeText.trim()) {
      alert("Please provide your resume text (paste or select a saved resume)");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste a job description");
      return;
    }

    try {
      const res = await generate({
        resumeText: resumeText.trim(),
        jobDescription: jobDescription.trim(),
        tone,
        resumeId: selectedResumeId || undefined,
      });
      setResult(res.data.coverLetter);
    } catch (err) {
      console.error("Cover letter error:", err);
      alert(err.response?.data?.error || "Failed to generate cover letter");
    }
  };

  const handleDelete = (id, idx) => {
    if (window.confirm("Delete this cover letter?")) {
      deleteCoverLetter(id);
      if (result?.id === id) setResult(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Generator */}
      <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">
            AI Cover Letter Generator
          </h1>
          <p className="mt-3 text-slate-300">
            Generate ATS-optimized cover letters tailored to specific job descriptions
          </p>
        </div>

        <div className="space-y-6">
          {/* Resume selection */}
          <div>
            <label className="mb-2 block text-lg font-semibold">Resume</label>
            {resumes.length > 0 && (
              <select
                value={selectedResumeId}
                onChange={async (e) => {
                  const id = e.target.value;
                  setSelectedResumeId(id);
                  if (id) {
                    try {
                      const { getResumeById } = await import("../services/api");
                      const res = await getResumeById(id);
                      setResumeText(res.data.resume.extractedText);
                    } catch { setResumeText(""); }
                  }
                }}
                className="mb-3 w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none focus:border-cyan-400"
              >
                <option value="">— Or paste resume below —</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.originalFile} ({r.fileType.toUpperCase()})
                  </option>
                ))}
              </select>
            )}
            <textarea
              rows="8"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none focus:border-cyan-400"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="mb-2 block text-lg font-semibold">Job Description</label>
            <textarea
              rows="8"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none focus:border-cyan-400"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="mb-2 block text-lg font-semibold">Tone</label>
            <div className="flex gap-3">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
                    tone === t.value
                      ? "bg-cyan-400 text-black"
                      : "border border-slate-600 text-slate-300 hover:border-cyan-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isPending || !resumeText.trim() || !jobDescription.trim()}
            className="w-full rounded-xl bg-cyan-400 px-6 py-4 text-lg font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {isPending ? "Generating Cover Letter..." : "Generate Cover Letter"}
          </button>

          {isPending && <Loader />}

          {genError && (
            <div className="rounded-xl bg-red-500/10 p-4 text-center text-red-400">
              {genError.response?.data?.error || "Generation failed. Please try again."}
            </div>
          )}

          {result && <CoverLetterResult result={result} />}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
          <h2 className="mb-4 text-2xl font-bold text-cyan-400">
            Cover Letter History ({history.length})
          </h2>

          {historyLoading ? (
            <Loader />
          ) : (
            <div className="space-y-4">
              {history.map((cl, idx) => (
                <div key={cl._id} className="rounded-xl bg-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-bold uppercase text-cyan-300">
                        {cl.tone}
                      </span>
                      <span className="ml-3 text-sm text-slate-400">
                        {formatDate(cl.createdAt)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(cl.content);
                        }}
                        className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:border-cyan-400 hover:text-cyan-400"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleDelete(cl._id, idx)}
                        disabled={isDeleting}
                        className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:border-red-500 hover:text-red-400"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                    {cl.content?.substring(0, 200)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CoverLetterSection;