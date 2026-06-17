import { useState } from "react";
import { downloadCoverLetterPDF } from "../services/api";

function CoverLetterResult({ result }) {
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!result?.id) {
      alert("Please save the cover letter first before downloading PDF.");
      return;
    }
    setDownloadingPdf(true);
    try {
      const res = await downloadCoverLetterPDF(result.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover-letter-${result.id}-${Date.now()}.pdf`;
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

  const downloadAsTxt = () => {
    const blob = new Blob([result.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${result.tone || "professional"}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsDoc = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; max-width: 8.5in; margin: 1in; }
    p { margin-bottom: 12pt; }
  </style>
</head>
<body>
  ${result.content.split("\n").map((p) => `<p>${p}</p>`).join("\n")}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${result.tone || "professional"}-${Date.now()}.doc`;
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
            Generated Cover Letter
          </h3>
          <span className="rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-bold uppercase text-cyan-300">
            {result.tone || "professional"} tone
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400"
          >
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
          <button
            onClick={downloadAsTxt}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400"
          >
            📥 TXT
          </button>
          <button
            onClick={downloadAsDoc}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400"
          >
            📥 DOC
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className="rounded-lg border border-red-600 px-4 py-2 text-sm text-red-300 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
          >
            {downloadingPdf ? "⏳" : "📄 PDF"}
          </button>
        </div>
      </div>

      <div className="space-y-4 leading-relaxed text-slate-300">
        {result.content.split("\n").map((paragraph, idx) => {
          const trimmed = paragraph.trim();
          if (!trimmed) return null;
          return (
            <p key={idx} className="text-justify">
              {trimmed}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default CoverLetterResult;