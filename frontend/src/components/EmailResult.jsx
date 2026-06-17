import { useState } from "react";

function EmailResult({ result }) {
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const copyToClipboard = async (text, setter) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const downloadAsTxt = () => {
    const content = `Subject: ${result.subject}\n\n${result.content}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-${result.emailType}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!result) return null;

  return (
    <div className="mt-8 rounded-2xl bg-slate-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">
            Generated Email
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-bold uppercase text-cyan-300">
              {result.emailType}
            </span>
            <span className="rounded bg-purple-400/10 px-2 py-0.5 text-xs font-bold uppercase text-purple-300">
              {result.tone || "formal"} tone
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={downloadAsTxt}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400"
          >
            📥 Download
          </button>
        </div>
      </div>

      {/* Subject */}
      <div className="mb-5 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Subject
          </span>
          <button
            onClick={() => copyToClipboard(result.subject, setCopiedSubject)}
            className="text-xs text-slate-500 hover:text-cyan-400"
          >
            {copiedSubject ? "✅ Copied" : "📋 Copy"}
          </button>
        </div>
        <p className="text-lg font-semibold text-white">{result.subject}</p>
      </div>

      {/* Body */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Body
          </span>
          <button
            onClick={() => copyToClipboard(result.content, setCopiedBody)}
            className="text-xs text-slate-500 hover:text-cyan-400"
          >
            {copiedBody ? "✅ Copied" : "📋 Copy"}
          </button>
        </div>
        <div className="space-y-4 leading-relaxed text-slate-300 whitespace-pre-wrap">
          {result.content}
        </div>
      </div>
    </div>
  );
}

export default EmailResult;