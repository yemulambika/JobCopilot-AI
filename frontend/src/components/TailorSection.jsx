import { useState } from "react";
import { useTailorResume } from "../hooks/useTailorResume";
import { useGetResumes } from "../hooks/useResumeUpload";
import TailoredResult from "./TailoredResult";
import Loader from "./Loader";

function TailorSection() {
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [masterResumeText, setMasterResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);

  const { mutateAsync: tailor, isPending, error: tailorError } = useTailorResume();
  const { data: resumesData } = useGetResumes();

  const resumes = resumesData?.resumes || [];

  const handleTailor = async () => {
    if (!masterResumeText.trim()) {
      alert("Please provide master resume text (paste it or select a saved resume)");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste a job description");
      return;
    }

    try {
      const res = await tailor({
        masterResumeText: masterResumeText.trim(),
        jobDescription: jobDescription.trim(),
        resumeId: selectedResumeId || undefined,
      });
      setResult(res.data.tailored);
    } catch (err) {
      console.error("Tailor error:", err);
      alert(err.response?.data?.error || "Failed to tailor resume. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">
            AI Resume Tailor
          </h1>
          <p className="mt-3 text-slate-300">
            Tailor your resume to a specific job description using AI — optimized for ATS
          </p>
        </div>

        <div className="space-y-6">
          {/* Select saved resume or paste */}
          <div>
            <label className="mb-2 block text-lg font-semibold">
              Master Resume
            </label>

            {resumes.length > 0 && (
              <div className="mb-3">
                <label className="mb-1 block text-sm text-slate-400">
                  Select a saved resume:
                </label>
                <select
                  value={selectedResumeId}
                  onChange={async (e) => {
                    const id = e.target.value;
                    setSelectedResumeId(id);
                    if (id) {
                      try {
                        const { getResumeById } = await import("../services/api");
                        const res = await getResumeById(id);
                        setMasterResumeText(res.data.resume.extractedText);
                      } catch {
                        setMasterResumeText("");
                      }
                    }
                  }}
                  className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none focus:border-cyan-400"
                >
                  <option value="">— Or paste manually below —</option>
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.originalFile} ({r.fileType.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <textarea
              rows="8"
              placeholder="Paste your master resume text here..."
              value={masterResumeText}
              onChange={(e) => setMasterResumeText(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none focus:border-cyan-400"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="mb-2 block text-lg font-semibold">
              Target Job Description
            </label>
            <textarea
              rows="8"
              placeholder="Paste the target job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none focus:border-cyan-400"
            />
          </div>

          {/* Tailor Button */}
          <button
            onClick={handleTailor}
            disabled={isPending || !masterResumeText.trim() || !jobDescription.trim()}
            className="w-full rounded-xl bg-cyan-400 px-6 py-4 text-lg font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {isPending ? "Optimizing Resume..." : "Tailor Resume with AI"}
          </button>

          {/* Loading */}
          {isPending && <Loader />}

          {tailorError && (
            <div className="rounded-xl bg-red-500/10 p-4 text-center text-red-400">
              {tailorError.response?.data?.error || "Tailoring failed. Please try again."}
            </div>
          )}

          {/* Result */}
          {result && (
            <TailoredResult
              result={result}
              masterResumeId={selectedResumeId || undefined}
              jobDescription={jobDescription.trim()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TailorSection;