import { useState } from "react";
import { useGenerateEmail, useGetEmails, useDeleteEmail } from "../hooks/useEmails";
import { useGetResumes } from "../hooks/useResumeUpload";
import EmailResult from "./EmailResult";
import Loader from "./Loader";

const EMAIL_TYPES = [
  { value: "recruiter", label: "Recruiter Email", icon: "👔" },
  { value: "referral", label: "Referral Request", icon: "🤝" },
  { value: "followup", label: "Follow-up Email", icon: "📬" },
  { value: "thankyou", label: "Interview Thank You", icon: "🙏" },
];

const TONES = [
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "concise", label: "Concise" },
];

const EMAIL_TYPE_LABELS = {
  recruiter: "Recruiter Email",
  referral: "Referral Request",
  followup: "Follow-up Email",
  thankyou: "Interview Thank You",
};

function EmailSection() {
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [emailType, setEmailType] = useState("recruiter");
  const [tone, setTone] = useState("formal");
  const [recipientName, setRecipientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);

  const { mutateAsync: generate, isPending, error: genError } = useGenerateEmail();
  const { data: resumesData } = useGetResumes();
  const { data: historyData, isLoading: historyLoading } = useGetEmails();
  const { mutate: deleteEmail, isPending: isDeleting } = useDeleteEmail();

  const resumes = resumesData?.resumes || [];
  const history = historyData?.emails || [];

  const handleGenerate = async () => {
    if (!resumeText.trim()) {
      alert("Please provide your resume text (paste or select a saved resume)");
      return;
    }

    try {
      const res = await generate({
        emailType,
        tone,
        recipientName: recipientName.trim(),
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
        resumeText: resumeText.trim(),
        resumeId: selectedResumeId || undefined,
      });
      setResult(res.data.email);
    } catch (err) {
      console.error("Email generation error:", err);
      alert(err.response?.data?.error || "Failed to generate email");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this email?")) {
      deleteEmail(id);
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
            AI Email Generator
          </h1>
          <p className="mt-3 text-slate-300">
            Generate professional emails tailored to your job search
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Type Selection */}
          <div>
            <label className="mb-3 block text-lg font-semibold">Email Type</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {EMAIL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setEmailType(type.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-4 text-sm font-medium transition ${
                    emailType === type.value
                      ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/20"
                      : "border border-slate-600 text-slate-300 hover:border-cyan-400"
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="mb-3 block text-lg font-semibold">Tone</label>
            <div className="flex gap-3">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
                    tone === t.value
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                      : "border border-slate-600 text-slate-300 hover:border-purple-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient / Company / Job Title */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Recipient Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Smith"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Job Title
              </label>
              <input
                type="text"
                placeholder="e.g. Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Resume */}
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
              rows="6"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none focus:border-cyan-400"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="mb-2 block text-lg font-semibold">Job Description (optional)</label>
            <textarea
              rows="6"
              placeholder="Paste the job description here (optional but recommended for better results)..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none focus:border-cyan-400"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isPending || !resumeText.trim()}
            className="w-full rounded-xl bg-cyan-400 px-6 py-4 text-lg font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {isPending ? "Generating Email..." : `Generate ${EMAIL_TYPE_LABELS[emailType] || "Email"}`}
          </button>

          {isPending && <Loader />}

          {genError && (
            <div className="rounded-xl bg-red-500/10 p-4 text-center text-red-400">
              {genError.response?.data?.error || "Generation failed. Please try again."}
            </div>
          )}

          {result && <EmailResult result={result} />}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-3xl bg-slate-800 p-8 shadow-2xl">
          <h2 className="mb-4 text-2xl font-bold text-cyan-400">
            Email History ({history.length})
          </h2>

          {historyLoading ? (
            <Loader />
          ) : (
            <div className="space-y-4">
              {history.map((email, idx) => (
                <div key={email._id} className="rounded-xl bg-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-bold uppercase text-cyan-300">
                        {email.emailType}
                      </span>
                      <span className="rounded bg-purple-400/10 px-2 py-0.5 text-xs font-bold uppercase text-purple-300">
                        {email.tone}
                      </span>
                      <span className="text-sm text-slate-400">
                        {formatDate(email.createdAt)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `Subject: ${email.subject}\n\n${email.content}`
                          );
                        }}
                        className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:border-cyan-400 hover:text-cyan-400"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleDelete(email._id)}
                        disabled={isDeleting}
                        className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:border-red-500 hover:text-red-400"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm font-medium text-white truncate">
                    {email.subject}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-300">
                    {email.content?.substring(0, 200)}...
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

export default EmailSection;