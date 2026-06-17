import React, { useState } from "react";
import { parseJobDescription } from "../utils/jobDescriptionParser";
import { improveResume } from "../utils/resumeImprover";

const ResumeImprover = () => {
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState(null);

  const handleImprove = () => {
    if (!resumeText.trim() || !jdText.trim()) {
      alert("Provide both resume and job description.");
      return;
    }
    const jd = parseJobDescription(jdText);
    const res = improveResume(resumeText, jd);
    setResult(res);
  };

  const applySuggestions = () => {
    if (result && result.improvedResume) {
      setResumeText(result.improvedResume);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Resume Improvement Engine</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <textarea
          placeholder="Paste your current resume text..."
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
        onClick={handleImprove}
        className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 mb-4"
      >
        Generate Improvements
      </button>

      {result && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Improvement Report</h3>
          <p>Current ATS Score: {result.currentScore}%</p>
          <p>Target ATS Score: {result.targetScore}%</p>
          <p>Suggested Improvements:</p>
          <ul className="list-disc list-inside">
            {result.improvements.map((imp, i) => (
              <li key={i}>{imp}</li>
            ))}
          </ul>

          <button
            onClick={applySuggestions}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            Apply Suggestions (one‑click)
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeImprover;