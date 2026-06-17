import { useState } from "react";
import { useSkillGap } from "../hooks/useSkillGap";
import { useGetResumes } from "../hooks/useResumeUpload";
import Loader from "./Loader";

function SkillGapAnalysis() {
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [expandedCourses, setExpandedCourses] = useState(false);

  const { analyze, result, isLoading, error, reset } = useSkillGap();
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

  // Group missing skills by category
  const groupByCategory = (skills) => {
    const groups = {};
    skills?.forEach((skill) => {
      const cat = skill.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    });
    return groups;
  };

  const missingByCategory = groupByCategory(result?.missingSkills);

  // Platform colors
  const platformColor = (platform) => {
    const map = {
      "Udemy": "bg-purple-600",
      "Coursera": "bg-blue-600",
      "freeCodeCamp": "bg-green-600",
      "edX": "bg-indigo-600",
      "EpicReact.dev": "bg-cyan-600",
      "Angular.io": "bg-red-600",
      "Vue School": "bg-emerald-600",
      "Svelte.dev": "bg-orange-600",
      "MongoDB": "bg-green-700",
      "Redis": "bg-red-700",
      "Elastic": "bg-yellow-600",
      "AWS": "bg-orange-500",
      "Google Cloud": "bg-blue-500",
      "Microsoft Learn": "bg-blue-700",
      "LeetCode": "bg-yellow-500",
      "Pluralsight": "bg-red-500",
      "HashiCorp Learn": "bg-blue-800",
      "DesignGurus": "bg-teal-600",
      "Stanford/edX": "bg-red-700",
      "Rust Docs": "bg-orange-700",
      "Udacity": "bg-blue-500",
    };
    return map[platform] || "bg-slate-600";
  };

  const difficultyBadge = (difficulty) => {
    const colors = {
      beginner: "bg-green-500/20 text-green-300",
      intermediate: "bg-yellow-500/20 text-yellow-300",
      advanced: "bg-red-500/20 text-red-300",
    };
    return colors[difficulty] || "bg-slate-500/20 text-slate-300";
  };

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
            Skill Gap Analysis
          </h1>
          <p className="mt-3 text-slate-300">
            Identify gaps between your skills and job requirements, with
            personalized course recommendations
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
                  <Loader small /> Analyzing Skill Gap...
                </span>
              ) : (
                "🔬 Analyze Skill Gap"
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
          {/* Score Overview */}
          <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white">Skill Gap Overview</h2>
            </div>

            <div className="mb-6">
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
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-center">
                <div className="text-3xl font-bold text-green-400">
                  {result.strongSkills?.length || 0}
                </div>
                <div className="mt-1 text-sm text-green-300">Strong Skills</div>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
                <div className="text-3xl font-bold text-red-400">
                  {result.missingSkills?.length || 0}
                </div>
                <div className="mt-1 text-sm text-red-300">Skill Gaps</div>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {result.recommendedCourses?.length || 0}
                </div>
                <div className="mt-1 text-sm text-purple-300">Courses Available</div>
              </div>
            </div>
          </div>

          {/* ─── Strong Skills ───────────────────────────── */}
          {result.strongSkills?.length > 0 && (
            <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-green-400">
                ✅ Strong Skills
              </h3>
              <p className="mb-4 text-sm text-slate-400">
                These skills from the job description are present in your resume.
              </p>
              <div className="flex flex-wrap gap-2">
                {result.strongSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-300"
                  >
                    {skill.name}
                    {skill.category && (
                      <span className="ml-1.5 text-xs text-green-500/60">
                        ({skill.category})
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ─── Missing Skills / Gaps by Category ──────────── */}
          {Object.keys(missingByCategory).length > 0 && (
            <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-red-400">
                ❌ Skill Gaps
              </h3>
              <p className="mb-4 text-sm text-slate-400">
                These skills from the job description are missing from your resume,
                grouped by category.
              </p>
              <div className="space-y-4">
                {Object.entries(missingByCategory).map(([category, skills], i) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-slate-700 bg-slate-700/30 overflow-hidden"
                    open={skills.length <= 3}
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-700/50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-200">
                          {category}
                        </span>
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                          {skills.length}
                        </span>
                      </div>
                      <svg
                        className="h-4 w-4 text-slate-400 transition group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="border-t border-slate-700 p-4">
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, j) => (
                          <span
                            key={j}
                            className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-300"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* ─── Recommended Courses ────────────────────────── */}
          {result.recommendedCourses?.length > 0 && (
            <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xl font-bold text-purple-400">
                  📚 Recommended Courses
                </h3>
                <button
                  onClick={() => setExpandedCourses(!expandedCourses)}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-400 hover:border-purple-400 hover:text-purple-400"
                >
                  {expandedCourses ? "Show Fewer" : "Show All"}
                </button>
              </div>
              <p className="mb-4 text-sm text-slate-400">
                Curated courses to help you close your skill gaps.
              </p>
              <div className="space-y-3">
                {(expandedCourses
                  ? result.recommendedCourses
                  : result.recommendedCourses.slice(0, 8)
                ).map((course, i) => (
                  <a
                    key={i}
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl border border-slate-700 bg-slate-700/30 p-4 transition hover:border-purple-500/50 hover:bg-slate-700/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-bold text-white ${platformColor(course.platform)}`}
                          >
                            {course.platform}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyBadge(course.difficulty)}`}
                          >
                            {course.difficulty}
                          </span>
                          <span className="text-xs text-slate-500">
                            ⏱ {course.duration}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-200 group-hover:text-purple-300 transition">
                          {course.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Gap skill: {course.skill}
                        </p>
                      </div>
                      <span className="shrink-0 text-slate-500 group-hover:text-purple-400 transition">
                        ↗
                      </span>
                    </div>
                  </a>
                ))}
              </div>
              {!expandedCourses && result.recommendedCourses.length > 8 && (
                <button
                  onClick={() => setExpandedCourses(true)}
                  className="mt-3 w-full rounded-lg border border-dashed border-slate-600 py-2 text-sm text-slate-400 hover:border-purple-400 hover:text-purple-400 transition"
                >
                  +{result.recommendedCourses.length - 8} more courses
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SkillGapAnalysis;