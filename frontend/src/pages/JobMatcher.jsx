import React, { useState, useEffect } from "react";
import { parseJobDescription } from "../utils/jobDescriptionParser";
import { matchJob } from "../utils/jobMatcher";

const JobMatcher = () => {
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState(null);
  const [jobs, setJobs] = useState([]);

  // Load saved jobs for recommendation demo
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    fetch("https://ai-resume-backend-1i32.onrender.com/api/jobs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setJobs(data.jobs || []));
  }, []);

  const handleMatch = () => {
    if (!resumeText.trim() || !jdText.trim()) {
      alert("Provide both resume and job description.");
      return;
    }
    const jd = parseJobDescription(jdText);
    const match = matchJob(resumeText, jd);
    setResult(match);
  };

  const generateTailoredResume = () => alert("Tailored resume generation placeholder.");
  const generateCoverLetter = () => alert("Cover letter generation placeholder.");
  const generateRecruiterEmail = () => alert("Recruiter email generation placeholder.");

  // Recommend jobs with ATS >= 80
  const recommendedJobs = jobs
    .map((job) => {
      const jd = parseJobDescription(job.jd);
      const match = matchJob(resumeText, jd);
      return { ...job, atsScore: match.atsScore };
    })
    .filter((j) => j.atsScore >= 80)
    .sort((a, b) => b.atsScore - a.atsScore);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Job Matcher</h2>

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
        onClick={handleMatch}
        className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 mb-4"
      >
        Match
      </button>

      {result && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Match Result</h3>
          <p>ATS Score: {result.atsScore}%</p>
          <p>Skill Match: {result.skillMatch}%</p>
          <p>Experience Match: {result.experienceMatch}%</p>
          <p>Education Match: {result.educationMatch}%</p>
          <p>
            Missing Skills:{" "}
            {result.missingSkills.length
              ? result.missingSkills.join(", ")
              : "None"}
          </p>
          <p>Recommendations:</p>
          <ul className="list-disc list-inside">
            {result.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <div className="mt-4 flex gap-4">
            <button
              onClick={generateTailoredResume}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Generate Tailored Resume
            </button>
            <button
              onClick={generateCoverLetter}
              className="bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Generate Cover Letter
            </button>
            <button
              onClick={generateRecruiterEmail}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Generate Recruiter Email
            </button>
          </div>
        </div>
      )}

      {recommendedJobs.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Recommended Jobs (ATS ≥ 80)</h3>
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Company</th>
                <th className="px-4 py-2 border">Location</th>
                <th className="px-4 py-2 border">Source</th>
                <th className="px-4 py-2 border">ATS Score</th>
                <th className="px-4 py-2 border">Link</th>
              </tr>
            </thead>
            <tbody>
              {recommendedJobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-4 py-2 border">{job.title}</td>
                  <td className="px-4 py-2 border">{job.company}</td>
                  <td className="px-4 py-2 border">{job.location}</td>
                  <td className="px-4 py-2 border">{job.source}</td>
                  <td className="px-4 py-2 border text-center">{job.atsScore}%</td>
                  <td className="px-4 py-2 border">
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JobMatcher;
