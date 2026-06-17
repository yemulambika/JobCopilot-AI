import { useState } from "react";
import Navbar from "../components/Navbar";
import { useCareerInsights } from "../hooks/useCareerInsights";
import { useGetResumes } from "../hooks/useResumeUpload";
import Loader from "../components/Loader";

function CareerInsightsPage() {
  const [resumeText, setResumeText] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [insights, setInsights] = useState(null);

  const { mutateAsync: analyze, isPending, error: analyzeError } = useCareerInsights();
  const { data: resumesData } = useGetResumes();
  const resumes = resumesData?.resumes || [];

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume text or select a saved resume.");
      return;
    }
    try {
      const res = await analyze({
        resumeText: resumeText.trim(),
        targetRole: targetRole.trim() || undefined,
        targetIndustry: targetIndustry.trim() || undefined,
      });
      setInsights(res.data.insights);
    } catch (err) {
      alert(err.response?.data?.error || "Analysis failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-cyan-400">🎯 AI Career Insights</h1>
            <p className="mt-3 text-slate-300">
              Get a comprehensive career analysis — resume score, skill recommendations,
              market trends, salary estimates, and interview prep.
            </p>
          </div>

          <div className="space-y-6">
            {/* Resume Selection */}
            <div>
              <label className="mb-2 block text-lg font-semibold">Your Resume</label>
              {resumes.length > 0 && (
                <div className="mb-3">
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
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none focus:border-cyan-400"
              />
            </div>

            {/* Optional: Target Role & Industry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Target Role (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Target Industry (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. FinTech, Healthcare, SaaS"
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isPending || !resumeText.trim()}
              className="w-full rounded-xl bg-cyan-400 px-6 py-4 text-lg font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {isPending ? "Analyzing Career..." : "🔍 Get Career Insights"}
            </button>

            {isPending && <Loader />}

            {analyzeError && (
              <div className="rounded-xl bg-red-500/10 p-4 text-center text-red-400">
                {analyzeError.response?.data?.error || "Analysis failed."}
              </div>
            )}

            {/* Results */}
            {insights && !insights.parseError && <InsightsResults data={insights} />}
            {insights?.parseError && (
              <div className="rounded-xl bg-amber-500/10 p-4 text-amber-300 text-sm">
                <p className="font-semibold mb-1">⚠️ Response parsing issue</p>
                <pre className="whitespace-pre-wrap text-xs text-slate-400">
                  {insights.raw}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** ─── Score Ring ─── */
function ScoreRing({ score, size = 100, strokeWidth = 8, color = "#22d3ee" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{score}</span>
      </div>
    </div>
  );
}

/** ─── Insights Results ─── */
function InsightsResults({ data }) {
  const { resumeScore, skillRecommendations, marketTrends, salaryEstimation, interviewPrep } = data;

  return (
    <div className="space-y-8 mt-8">
      {/* Resume Score */}
      {resumeScore && (
        <section className="rounded-2xl bg-slate-900 p-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">📊 Resume Score</h3>
          <div className="flex items-center gap-8 flex-wrap">
            <ScoreRing score={resumeScore.overall} />
            <div className="flex-1 min-w-[200px]">
              {resumeScore.breakdown && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(resumeScore.breakdown).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 capitalize">{key}</span>
                        <span className="text-white font-medium">{val}/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-cyan-500 transition-all duration-700"
                          style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-sm text-slate-400">{resumeScore.summary}</p>
            </div>
          </div>
        </section>
      )}

      {/* Skill Recommendations */}
      {skillRecommendations && (
        <section className="rounded-2xl bg-slate-900 p-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">🎯 Skill Recommendations</h3>

          {/* In-Demand Skills */}
          {skillRecommendations.inDemand?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">In-Demand Skills to Highlight</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {skillRecommendations.inDemand.map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{s.skill}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        s.demandLevel === "high"
                          ? "bg-red-900/40 text-red-300 border border-red-700"
                          : "bg-amber-900/40 text-amber-300 border border-amber-700"
                      }`}>
                        {s.demandLevel} demand
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{s.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* To Learn */}
          {skillRecommendations.toLearn?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Skills to Learn</h4>
              <div className="space-y-2">
                {skillRecommendations.toLearn.map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-white">{s.skill}</span>
                      <span className="ml-2 text-xs text-slate-500">• {s.timeline}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.priority === "high"
                        ? "bg-red-900/40 text-red-300 border border-red-700"
                        : s.priority === "medium"
                        ? "bg-amber-900/40 text-amber-300 border border-amber-700"
                        : "bg-slate-700 text-slate-400 border border-slate-600"
                    }`}>
                      {s.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Strengths */}
          {skillRecommendations.existingStrengths?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Existing Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {skillRecommendations.existingStrengths.map((s, i) => (
                  <span key={i} className="rounded-full bg-green-900/30 border border-green-700 px-3 py-1 text-sm text-green-300">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Market Trends */}
      {marketTrends && (
        <section className="rounded-2xl bg-slate-900 p-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">📈 Market Trends</h3>
          <p className="text-sm text-slate-300 mb-4">{marketTrends.industryOutlook}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketTrends.hotRoles?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Hot Roles Hiring</h4>
                <div className="flex flex-wrap gap-2">
                  {marketTrends.hotRoles.map((r, i) => (
                    <span key={i} className="rounded-lg bg-orange-900/30 border border-orange-700 px-2 py-1 text-xs text-orange-300">{r}</span>
                  ))}
                </div>
              </div>
            )}
            {marketTrends.emergingTech?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Emerging Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {marketTrends.emergingTech.map((t, i) => (
                    <span key={i} className="rounded-lg bg-purple-900/30 border border-purple-700 px-2 py-1 text-xs text-purple-300">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {marketTrends.advice && (
            <div className="mt-4 p-3 rounded-lg bg-cyan-900/20 border border-cyan-800">
              <p className="text-sm text-cyan-300">💡 {marketTrends.advice}</p>
            </div>
          )}
        </section>
      )}

      {/* Salary Estimation */}
      {salaryEstimation && (
        <section className="rounded-2xl bg-slate-900 p-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">💰 Salary Estimation</h3>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-3xl font-bold text-green-400">
              ${(salaryEstimation.range?.min || 0).toLocaleString()}
            </span>
            <span className="text-slate-500">—</span>
            <span className="text-3xl font-bold text-green-400">
              ${(salaryEstimation.range?.max || 0).toLocaleString()}
            </span>
            <span className="text-sm text-slate-400">{salaryEstimation.range?.currency || "USD"}</span>
          </div>
          {salaryEstimation.factors?.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-slate-400">Factors: </span>
              <span className="text-xs text-slate-300">{salaryEstimation.factors.join(", ")}</span>
            </div>
          )}
          {salaryEstimation.note && (
            <p className="text-xs text-amber-400 mt-2">⚠️ {salaryEstimation.note}</p>
          )}
        </section>
      )}

      {/* Interview Prep */}
      {interviewPrep && (
        <section className="rounded-2xl bg-slate-900 p-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">🎤 Interview Preparation</h3>

          {interviewPrep.commonQuestions?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Common Questions</h4>
              <div className="space-y-3">
                {interviewPrep.commonQuestions.map((q, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                    <p className="text-sm font-medium text-white mb-1">"{q.question}"</p>
                    <p className="text-xs text-cyan-300 mb-1">Strategy: {q.strategy}</p>
                    {q.example && <p className="text-xs text-slate-500 italic">Example: "{q.example}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {interviewPrep.technicalTopics?.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Technical Topics to Review</h4>
              <div className="flex flex-wrap gap-2">
                {interviewPrep.technicalTopics.map((t, i) => (
                  <span key={i} className="rounded-lg bg-blue-900/30 border border-blue-700 px-2 py-1 text-xs text-blue-300">{t}</span>
                ))}
              </div>
            </div>
          )}

          {interviewPrep.behavioralTips?.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Behavioral Tips</h4>
              <ul className="space-y-1">
                {interviewPrep.behavioralTips.map((tip, i) => (
                  <li key={i} className="text-xs text-slate-400 flex gap-2">
                    <span className="text-cyan-400">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {interviewPrep.questionsToAsk?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Questions to Ask Them</h4>
              <ul className="space-y-1">
                {interviewPrep.questionsToAsk.map((q, i) => (
                  <li key={i} className="text-xs text-slate-400 flex gap-2">
                    <span className="text-green-400">→</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default CareerInsightsPage;