import React, { useState } from "react";
import { parseJobDescription } from "../utils/jobDescriptionParser";
import { optimizeResume } from "../utils/keywordOptimizer";

const KeywordOptimizer = () => {
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState(null);

  const handleOptimize = () => {
    if (!resumeText.trim() || !jdText.trim()) {
      alert("Please provide both resume and job description.");
      return;
    }
    const jd = parseJobDescription(jdText);
    const opt = optimizeResume(resumeText, jd);
    setResult(opt);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">AI Keyword Optimizer</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <textarea
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={12}
          className="border p-2 rounded w-full"
        />
        <textarea
          placeholder="Paste the job description here..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          rows={12}
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        onClick={handleOptimize}
        className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
      >
        Optimize Keywords
      </button>

      {result && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Results</h3>
          <p>
            <strong>ATS Impact Score:</strong> {result.atsImpactScore}%
          </p>

          {result.missingKeywords.length > 0 ? (
            <>
              <p className="mt-2">
                <strong>Missing Keywords ({result.missingKeywords.length}):</strong>
              </p>
              <ul className="list-disc list-inside">
                {result.missingKeywords.map((kw) => (
                  <li key={kw}>{kw}</li>
                ))}
              </ul>

              <p className="mt-2">
                <strong>Suggested Placement:</strong>
              </p>
              <table className="min-w-full border mt-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Keyword</th>
                    <th className="px-4 py-2 border">Suggested Section</th>
                  </tr>
                </thead>
                <tbody>
                  {result.suggestions.map((s) => (
                    <tr key={s.keyword}>
                      <td className="px-4 py-2 border">{s.keyword}</td>
                      <td className="px-4 py-2 border">{s.section}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="mt-2">All required keywords are already present.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default KeywordOptimizer;