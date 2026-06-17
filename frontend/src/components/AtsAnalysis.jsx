import { useState } from "react";
import { useAtsAnalysis } from "../hooks/useAtsAnalysis";
import { useGetResumes } from "../hooks/useResumeUpload";
import Loader from "./Loader";

function AtsAnalysis() {
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showAllKeywords, setShowAllKeywords] = useState(false);

  const { analyze, result, isLoading, error, reset } = useAtsAnalysis();
  const { data: resumesData } = useGetResumes();
  const resumes = resumesData?.resumes || [];

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert("Please provide your resume text");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste a job description");
      return;
    }
    await analyze(resumeText.trim(), jobDescription.trim());
  };

  // ─── Severity badge color ───────────────────────────────
  const severityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  // ─── Score color ────────────────────────────────────────
  const scoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const scoreBarColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* ─── Input Form ───────────────────────────────────── */}
      <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">
            ATS Resume Analyzer
          </h1>
          <p className="mt-3 text-slate-300">
            Get detailed ATS scoring with keyword analysis, semantic matching, and
            actionable suggestions
          </p>
        </div>

        <div className="space-y-6">
          {/* Resume */}
          <div>
            <label className="mb-2 block text-lg font-semibold">
              Your Resume
            </label>
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
                    } catch {
                      setResumeText("");
                    }
                  }
                }}
                className="mb-3 w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none focus:border-cyan-400"
              >
                <option value="">— Select saved resume —</option>
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
            <label className="mb-2 block text-lg font-semibold">
              Job Description
            </label>
            <textarea
              rows="8"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none focus:border-cyan-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !resumeText.trim() || !jobDescription.trim()}
              className="flex-1 rounded-xl bg-cyan-400 px-6 py-4 text-lg font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader small /> Analyzing Resume...
                </span>
              ) : (
                "🔍 Analyze Resume"
              )}
            </button>
            {result && (
              <button
                onClick={reset}
                className="rounded-xl border border-slate-600 px-6 py-4 text-lg font-medium text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400"
              >
                Reset
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 p-4 text-center text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* ─── Results ────────────────────────────────────────── */}
      {result && (
        <div className="space-y-8">
          {/* Score Card */}
          <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white">ATS Match Score</h2>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-400">Match Score</span>
                <span className={`text-4xl font-bold ${scoreColor(result.score)}`}>
                  {result.score}%
                </span>
              </div>
              <div className="h-5 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${scoreBarColor(result.score)}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{result.matched?.length || 0}</div>
                <div className="mt-1 text-sm text-slate-400">Skills Matched</div>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{result.missing?.length || 0}</div>
                <div className="mt-1 text-sm text-slate-400">Skills Missing</div>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{result.semanticScore ?? "—"}</div>
                <div className="mt-1 text-sm text-slate-400">Semantic Score</div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          {result.explanation?.length > 0 && (
            <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
              <h3 className="mb-4 text-xl font-bold text-cyan-400">Analysis Summary</h3>
              <ul className="space-y-2">
                {result.explanation.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <span className="mt-0.5">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-green-400">
                ✅ Resume Strengths
              </h3>
              <div className="space-y-3">
                {result.strengths.map((strength, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-slate-300"
                  >
                    {strength}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak Areas */}
          {result.weakAreas?.length > 0 && (
            <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-orange-400">
                ⚠️ Areas for Improvement
              </h3>
              <div className="space-y-4">
                {result.weakAreas.map((area, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-4 ${severityColor(area.severity)}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold">{area.area}</h4>
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase ${severityColor(area.severity)}`}
                      >
                        {area.severity}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {area.skills.map((skill, j) => (
                        <span
                          key={j}
                          className="rounded bg-slate-700/50 px-2 py-1 text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {result.missing?.length > 0 && (
            <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-red-400">
                ❌ Missing Keywords
              </h3>
              <p className="mb-4 text-sm text-slate-400">
                The following skills from the job description were not found in your resume.
                Consider adding relevant experience or projects for these keywords.
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missing.map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Matched Keywords */}
          {result.matched?.length > 0 && (
            <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-green-400">
                ✅ Matched Keywords
              </h3>
              <p className="mb-4 text-sm text-slate-400">
                These skills from the job description were found in your resume.
              </p>
              <div className="flex flex-wrap gap-2">
                {result.matched.map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extra Skills */}
          {result.extraResumeSkills?.length > 0 && (
            <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-blue-400">
                💪 Extra Skills
              </h3>
              <p className="mb-4 text-sm text-slate-400">
                These skills are on your resume but weren't mentioned in the job description.
              </p>
              <div className="flex flex-wrap gap-2">
                {result.extraResumeSkills.slice(0, 20).map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-300"
                  >
                    {skill}
                  </span>
                ))}
                {result.extraResumeSkills.length > 20 && (
                  <span className="rounded-full border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-slate-400">
                    +{result.extraResumeSkills.length - 20} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-purple-400">
                💡 Suggestions
              </h3>
              <div className="space-y-3">
                {result.suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-slate-300"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords Detail */}
          <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-cyan-400">
                📊 Keyword Frequency Analysis
              </h3>
              <button
                onClick={() => setShowAllKeywords(!showAllKeywords)}
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-400 hover:border-cyan-400 hover:text-cyan-400"
              >
                {showAllKeywords ? "Show Less" : "Show More"}
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* JD Keywords */}
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                  Job Description Keywords
                </h4>
                <div className="space-y-1.5">
                  {(showAllKeywords
                    ? result.jdKeywords
                    : result.jdKeywords?.slice(0, 10)
                  )?.map((kw, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-slate-700 px-3 py-2"
                    >
                      <span className="text-sm text-slate-300">{kw.word}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-600">
                          <div
                            className="h-full rounded-full bg-cyan-500"
                            style={{ width: `${Math.min(kw.score, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{kw.frequency}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resume Keywords */}
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                  Your Resume Keywords
                </h4>
                <div className="space-y-1.5">
                  {(showAllKeywords
                    ? result.resumeKeywords
                    : result.resumeKeywords?.slice(0, 10)
                  )?.map((kw, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-slate-700 px-3 py-2"
                    >
                      <span className="text-sm text-slate-300">{kw.word}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-600">
                          <div
                            className="h-full rounded-full bg-purple-500"
                            style={{ width: `${Math.min(kw.score, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{kw.frequency}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AtsAnalysis;