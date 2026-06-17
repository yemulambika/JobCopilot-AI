import React, { useState } from "react";
import { parseJobDescription } from "../utils/jobDescriptionParser";
import { computeMatchScore } from "../utils/matchResume";

/**
 * Component allowing users to:
 * 1. Paste a Job Description (JD)
 * 2. Upload multiple resume files (plain text or .txt)
 * 3. See a ranking table with match scores and a recommendation
 */
const ResumeRanking = () => {
  const [jdText, setJdText] = useState("");
  const [resumeFiles, setResumeFiles] = useState([]);
  const [results, setResults] = useState([]);

  // Parse JD and compute scores when user clicks "Rank Resumes"
  const handleRank = async () => {
    if (!jdText.trim() || resumeFiles.length === 0) {
      alert("Please provide a job description and at least one resume.");
      return;
    }

    const jd = parseJobDescription(jdText);

    const newResults = await Promise.all(
      resumeFiles.map(async (file) => {
        const text = await file.text();
        const score = computeMatchScore(text, jd);
        return {
          name: file.name,
          score,
        };
      })
    );

    // Sort descending by score
    newResults.sort((a, b) => b.score - a.score);
    setResults(newResults);
  };

  const handleFileChange = (e) => {
    setResumeFiles(Array.from(e.target.files));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Resume Ranking</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">Job Description (paste text)</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={6}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full job description here..."
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Upload Resumes (multiple)</label>
        <input
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          multiple
          onChange={handleFileChange}
          className="border rounded p-1"
        />
      </div>

      <button
        onClick={handleRank}
        className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
      >
        Rank Resumes
      </button>

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Ranking Results</h3>
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Resume</th>
                <th className="px-4 py-2 border">Match Score (%)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={r.name} className={idx === 0 ? "bg-green-100" : ""}>
                  <td className="px-4 py-2 border text-center">{idx + 1}</td>
                  <td className="px-4 py-2 border">{r.name}</td>
                  <td className="px-4 py-2 border text-center">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 font-medium">
            Recommended: <span className="text-green-800">{results[0].name}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumeRanking;