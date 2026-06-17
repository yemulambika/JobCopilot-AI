import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const JobCollector = () => {
  const { user } = useAuth();
  const [manualUrl, setManualUrl] = useState("");
  const [importFile, setImportFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("");

  const token = () => localStorage.getItem("jwt");

  // Load existing jobs
  useEffect(() => {
    if (!user) return;
fetch("https://ai-resume-backend-1i32.onrender.com/api/jobs", {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then((r) => r.json())
      .then((data) => setJobs(data.jobs || []));
  }, [user]);

  // Manual paste job URL → fetch job details via simple extraction
  const handleAddUrl = async () => {
    if (!manualUrl.trim()) {
      alert("Please paste a job URL.");
      return;
    }
    setMessage("Extracting job details... (simulated)");

    // In a real extension, we'd parse the page. Here we ask user to provide details manually.
    const title = prompt("Job title:");
    const company = prompt("Company:");
    const location = prompt("Location:");
    const jd = prompt("Job description (paste text):");
    const salary = prompt("Salary (optional):");
    const employmentType = prompt("Employment type (optional):");
    const postedDate = prompt("Posted date (optional):");
    const source = prompt("Source (LinkedIn / Naukri / Wellfound / Greenhouse / Lever / Workday):") || "manual";

    if (!title || !company || !location || !jd) {
      alert("Required fields missing. Aborting.");
      return;
    }

    const resp = await fetch("https://ai-resume-backend-1i32.onrender.com/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({
        title,
        company,
        location,
        source,
        jd,
        url: manualUrl,
        salary,
        employmentType,
        postedDate,
      }),
    });
    const data = await resp.json();
    if (data.success) {
      setMessage(`✅ Job saved${data.duplicate ? " (duplicate, skipped)" : ""}`);
      setManualUrl("");
      // Reload jobs list
      const jobsResp = await fetch("https://ai-resume-backend-1i32.onrender.com/api/jobs", {
        headers: { Authorization: `Bearer ${token()}` },
      }).then((r) => r.json());
      setJobs(jobsResp.jobs || []);
    } else {
      setMessage("❌ Error saving job.");
    }
  };

  // Import saved jobs from JSON file
  const handleImportFile = async () => {
    if (!importFile) {
      alert("Please select a JSON file.");
      return;
    }
    const text = await importFile.text();
    let parsedJobs;
    try {
      parsedJobs = JSON.parse(text);
      if (!Array.isArray(parsedJobs)) parsedJobs = [parsedJobs];
    } catch {
      alert("Invalid JSON file.");
      return;
    }

    let imported = 0;
    for (const job of parsedJobs) {
      if (!job.title || !job.company || !job.location || !job.jd || !job.url) continue;
      const resp = await fetch("https://ai-resume-backend-1i32.onrender.com/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          location: job.location,
          source: job.source || "import",
          jd: job.jd,
          url: job.url,
          salary: job.salary || "",
          employmentType: job.employmentType || "",
          postedDate: job.postedDate || "",
        }),
      });
      const data = await resp.json();
      if (data.success && !data.duplicate) imported++;
    }
    setMessage(`✅ Imported ${imported} new jobs (duplicates skipped).`);
    const jobsResp = await fetch("https://ai-resume-backend-1i32.onrender.com/api/jobs", {
      headers: { Authorization: `Bearer ${token()}` },
    }).then((r) => r.json());
    setJobs(jobsResp.jobs || []);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">AI Job Collector</h2>
      <p className="text-sm text-slate-600 mb-4">
        Collect job postings without logging in, scraping, or auto‑applying.
      </p>

      {/* 1. Manual paste URL */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Manual URL Entry</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Paste job URL here..."
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleAddUrl}
            className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
          >
            Add Job
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          You will be prompted to enter job details. Supported sources: LinkedIn, Naukri, Wellfound,
          Greenhouse, Lever, Workday.
        </p>
      </div>

      {/* 2. Import saved jobs (JSON) */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Import Saved Jobs</h3>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            onChange={(e) => setImportFile(e.target.files[0])}
            className="border p-2 rounded"
          />
          <button
            onClick={handleImportFile}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Import
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Upload a JSON file with an array of job objects (title, company, location, jd, url, source, etc.).
        </p>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded bg-blue-50 text-blue-800 text-sm">
          {message}
        </div>
      )}

      {/* List stored jobs */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Stored Jobs ({jobs.length})</h3>
        {jobs.length === 0 && (
          <p className="text-sm text-slate-500">No jobs collected yet.</p>
        )}
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border">Company</th>
              <th className="px-4 py-2 border">Location</th>
              <th className="px-4 py-2 border">Source</th>
              <th className="px-4 py-2 border">Salary</th>
              <th className="px-4 py-2 border">Employment Type</th>
              <th className="px-4 py-2 border">Posted Date</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td className="px-4 py-2 border">{job.title}</td>
                <td className="px-4 py-2 border">{job.company}</td>
                <td className="px-4 py-2 border">{job.location}</td>
                <td className="px-4 py-2 border">{job.source}</td>
                <td className="px-4 py-2 border">{job.salary || "—"}</td>
                <td className="px-4 py-2 border">{job.employmentType || "—"}</td>
                <td className="px-4 py-2 border">{job.postedDate || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobCollector;