import React, { useState, useEffect } from "react";
import { parseJobDescription } from "../utils/jobDescriptionParser";
import { matchJob } from "../utils/jobMatcher";

const JobFeed = () => {
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filters, setFilters] = useState({
    remote: "",
    location: "",
    experience: "",
    salary: "",
    company: "",
  });
  const [loading, setLoading] = useState(false);

  // Load all jobs from backend
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;
fetch("https://ai-resume-backend-1i32.onrender.com/api/jobs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setMatchedJobs(data.jobs || []));
  }, []);

  const handleGenerate = async () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume text.");
      return;
    }
    const jobs = await fetch("https://ai-resume-backend-1i32.onrender.com/api/jobs", {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    }).then((r) => r.json());
    const jobsData = jobs.jobs || [];

    const results = jobsData.map((job) => {
      const jd = parseJobDescription(job.jd);
      const match = matchJob(resumeText, jd);
      return { ...job, atsScore: match.atsScore, missingSkills: match.missingSkills };
    });

    // Sort by ATS score descending
    results.sort((a, b) => b.atsScore - a.atsScore);
    setMatchedJobs(results);
    setFilteredJobs(results);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    if (!matchedJobs.length) return;
    const filtered = matchedJobs.filter((job) => {
      const matchesRemote = filters.remote ? job.remote === "true" : true;
      const matchesLocation = filters.location
        ? job.location.toLowerCase().includes(filters.location.toLowerCase())
        : true;
      const matchesExperience = filters.experience
        ? job.experience?.toLowerCase().includes(filters.experience.toLowerCase())
        : true;
      const matchesSalary = filters.salary
        ? job.salary?.toLowerCase().includes(filters.salary.toLowerCase())
        : true;
      const matchesCompany = filters.company
        ? job.company.toLowerCase().includes(filters.company.toLowerCase())
        : true;
      return matchesRemote && matchesLocation && matchesExperience && matchesSalary && matchesCompany;
    });
    setFilteredJobs(filtered);
  };

  const handleBookmark = async (job) => {
    const token = localStorage.getItem("jwt");
    await fetch("https://ai-resume-backend-1i32.onrender.com/api/bookmarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: job.title,
        company: job.company,
        url: job.url,
        notes: "",
        tags: ["bookmarked"],
      }),
    });
    alert("Job bookmarked!");
  };

  const generateCoverLetter = (job) => alert("Cover letter generation placeholder.");

  const generateTailoredResume = (job) => alert("Tailored resume generation placeholder.");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">AI Job Feed</h2>

      {/* Resume Input */}
      <div className="mb-6">
        <label className="block font-medium mb-1">Paste Your Resume Text</label>
        <textarea
          placeholder="Enter your resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={12}
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={handleGenerate}
          className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
        >
          Generate Matching Jobs
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <label className="block font-medium mb-1">Apply Filters</label>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            type="text"
            name="remote"
            placeholder="Remote (true/false)"
            value={filters.remote}
            onChange={handleFilterChange}
            className="border p-1 rounded"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={filters.location}
            onChange={handleFilterChange}
            className="border p-1 rounded"
          />
          <select
            name="experience"
            value={filters.experience}
            onChange={handleFilterChange}
            className="border p-1 rounded"
          >
            <option value="">Any Experience</option>
            <option value="Entry">Entry</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
          </select>
          <input
            type="text"
            name="salary"
            placeholder="Salary"
            value={filters.salary}
            onChange={handleFilterChange}
            className="border p-1 rounded"
          />
          <input
            type="text"
            name="company"
            placeholder="Company"
            value={filters.company}
            onChange={handleFilterChange}
            className="border p-1 rounded"
          />
        </div>
        <button
          onClick={handleApplyFilters}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          Apply Filters
        </button>
      </div>

      {/* Matched Jobs */}
      {matchedJobs.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Best Matched Jobs</h3>
          {(filteredJobs.length > 0 ? filteredJobs : matchedJobs).map((job) => (
            <div key={job.id} className="border-b border-slate-300 py-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <h4 className="font-medium">{job.title}</h4>
                  <p className="text-sm text-slate-600">{job.company}</p>
                  <p className="text-sm text-slate-600">{job.location}</p>
                  <p className="text-sm text-slate-600">Source: {job.source}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">ATS Score: {job.atsScore}%</p>
                  <p className="text-sm text-slate-600">
                    Missing Skills: {job.missingSkills?.length ? job.missingSkills.join(", ") : "None"}
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={() => generateTailoredResume(job)}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Tailor Resume
                    </button>
                    <button
                      onClick={() => generateCoverLetter(job)}
                      className="bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                    >
                      Generate Cover Letter
                    </button>
                    <button
                      onClick={() => handleBookmark(job)}
                      className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                    >
                      Bookmark
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!matchedJobs.length && (
        <p className="text-sm text-slate-500">No jobs loaded yet. Click "Generate Matching Jobs" to see matches.</p>
      )}
    </div>
  );
};

export default JobFeed;