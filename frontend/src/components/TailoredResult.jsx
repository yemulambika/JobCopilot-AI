import { useState } from "react";
import { downloadTailoredResumePDF } from "../services/api";
import { useCreateResumeVersion } from "../hooks/useResumeVersions";

function TailoredResult({ result, masterResumeId, jobDescription }) {
  const [copiedField, setCopiedField] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);
  const [versionSaved, setVersionSaved] = useState(false);
  const createVersionMutation = useCreateResumeVersion();

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!result?.id) {
      alert("Please save the tailored resume first before downloading PDF.");
      return;
    }
    setDownloadingPdf(true);
    try {
      const res = await downloadTailoredResumePDF(result.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `tailored-resume-${result.id}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      alert(err.response?.data?.error || "Failed to download PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (!result) return null;

  return (
    <div className="mt-8 space-y-6">
      {/* Tailored Summary */}
      <div className="rounded-2xl bg-slate-900 p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-bold text-cyan-400">
            📝 Tailored Summary
          </h3>
          <button
            onClick={() => copyToClipboard(result.tailoredSummary, "summary")}
            className="rounded-lg border border-slate-600 px-3 py-1 text-xs text-slate-400 transition hover:border-cyan-400 hover:text-cyan-400"
          >
            {copiedField === "summary" ? "✅ Copied" : "📋 Copy"}
          </button>
        </div>
        <p className="leading-relaxed text-slate-300">{result.tailoredSummary}</p>
      </div>

      {/* Optimized Skills */}
      {result.optimizedSkills?.length > 0 && (
        <div className="rounded-2xl bg-slate-900 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-bold text-cyan-400">
              🎯 Optimized Skills ({result.optimizedSkills.length})
            </h3>
            <button
              onClick={() =>
                copyToClipboard(result.optimizedSkills.join(", "), "skills")
              }
              className="rounded-lg border border-slate-600 px-3 py-1 text-xs text-slate-400 transition hover:border-cyan-400 hover:text-cyan-400"
            >
              {copiedField === "skills" ? "✅ Copied" : "📋 Copy"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.optimizedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 text-sm font-medium text-cyan-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improved Experience */}
      {result.improvedExperience?.length > 0 && (
        <div className="rounded-2xl bg-slate-900 p-6">
          <h3 className="mb-3 text-xl font-bold text-cyan-400">
            💼 Improved Experience Bullet Points
          </h3>
          <div className="space-y-4">
            {result.improvedExperience.map((item, idx) => (
              <div key={idx} className="rounded-xl bg-slate-800 p-4">
                <div className="mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
                    Original
                  </span>
                  <p className="mt-1 text-slate-400">{item.original}</p>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
                      Improved
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(item.improved, `exp-${idx}`)
                      }
                      className="rounded border border-slate-600 px-2 py-0.5 text-xs text-slate-400 hover:border-cyan-400 hover:text-cyan-400"
                    >
                      {copiedField === `exp-${idx}` ? "✅" : "📋"}
                    </button>
                  </div>
                  <p className="mt-1 text-white">{item.improved}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ATS Keywords */}
      {result.atsKeywords?.length > 0 && (
        <div className="rounded-2xl bg-slate-900 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-bold text-cyan-400">
              🔑 ATS Keywords ({result.atsKeywords.length})
            </h3>
            <button
              onClick={() =>
                copyToClipboard(result.atsKeywords.join(", "), "keywords")
              }
              className="rounded-lg border border-slate-600 px-3 py-1 text-xs text-slate-400 transition hover:border-cyan-400 hover:text-cyan-400"
            >
              {copiedField === "keywords" ? "✅ Copied" : "📋 Copy"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.atsKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="rounded-full bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 text-sm font-medium text-yellow-300"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Copy All */}
      <div className="text-center">
        <button
          onClick={() => {
            const allText = [
              "TAILORED SUMMARY",
              result.tailoredSummary,
              "",
              "OPTIMIZED SKILLS",
              (result.optimizedSkills || []).join(", "),
              "",
              "IMPROVED EXPERIENCE",
              ...(result.improvedExperience || []).map(
                (e) => `Original: ${e.original}\nImproved: ${e.improved}`
              ),
              "",
              "ATS KEYWORDS",
              (result.atsKeywords || []).join(", "),
            ].join("\n");
            copyToClipboard(allText, "all");
          }}
          className="rounded-xl border border-cyan-400 px-6 py-3 text-sm font-bold text-cyan-400 transition hover:bg-cyan-400 hover:text-black"
        >
          {copiedField === "all" ? "✅ All Copied!" : "📋 Copy All Results"}
        </button>
      </div>

      {/* Save Version + Download PDF */}
      <div className="text-center mt-6 flex items-center justify-center gap-4">
        <button
          onClick={async () => {
            setSavingVersion(true);
            try {
              // Build plain text content from the result
              const content = [
                `TAILORED SUMMARY\n${result.tailoredSummary}`,
                `OPTIMIZED SKILLS\n${(result.optimizedSkills || []).join(", ")}`,
                "IMPROVED EXPERIENCE",
                ...(result.improvedExperience || []).map(
                  (e) => `Original: ${e.original}\nImproved: ${e.improved}`
                ),
                `ATS KEYWORDS\n${(result.atsKeywords || []).join(", ")}`,
              ].join("\n\n");

              await createVersionMutation.mutateAsync({
                masterResumeId: masterResumeId || undefined,
                label: `Tailored — ${result.rawResponse ? "AI Generated" : "Manual"}`,
                type: "tailored",
                content,
                jobDescription: jobDescription || "",
                metadata: {
                  skills: result.optimizedSkills || [],
                },
              });
              setVersionSaved(true);
              setTimeout(() => setVersionSaved(false), 3000);
            } catch (err) {
              console.error("Save version error:", err);
              alert("Failed to save version. Please try again.");
            } finally {
              setSavingVersion(false);
            }
          }}
          disabled={savingVersion || versionSaved}
          className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {versionSaved ? "✅ Saved!" : savingVersion ? "⏳ Saving..." : "💾 Save as Version"}
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={downloadingPdf}
          className="rounded-xl bg-red-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-400 disabled:opacity-50"
        >
          {downloadingPdf ? "⏳ Generating PDF..." : "📄 Download as PDF"}
        </button>
      </div>
    </div>
  );
}

export default TailoredResult;
