import { useState } from "react";
import { useUploadResume } from "../hooks/useResumeUpload";
import { useResumeAnalysis } from "../hooks/useResumeAnalysis";
import ResultCard from "./ResultCard";
import Loader from "./Loader";

function UploadSection() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadResume();
  const { analyze, isLoading: isAnalyzing } = useResumeAnalysis();

  const isLoading = isUploading || isAnalyzing;

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a resume file (PDF or DOCX)");
      return;
    }

    try {
      // Step 1 — Upload and parse file, save to MongoDB
      const uploadRes = await uploadFile(file);
      setUploadSuccess(uploadRes.data.resume);
      const resumeText = uploadRes.data.resume.extractedText;

      // Step 2 — If job description provided, also run matching
      if (jobDescription.trim()) {
        const matchResult = await analyzeResumeText(resumeText, jobDescription);
        setResult(matchResult);
      }
    } catch (err) {
      console.error("ERROR:", err);
      alert(err.response?.data?.error || "Something went wrong while analyzing resume");
    }
  };

  const analyzeResumeText = async (resumeText, jd) => {
    const { matchResume } = await import("../services/api");
    const res = await matchResume(resumeText, jd);
    return res.data;
  };

  return (
    <div className="w-full max-w-4xl rounded-3xl bg-slate-800 p-8 shadow-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-cyan-400">
          AI Resume Screening System
        </h1>
        <p className="mt-3 text-slate-300">
          Upload resume (PDF or DOCX) and compare with job description using AI logic
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload Resume */}
        <div>
          <label className="mb-2 block text-lg font-semibold">
            Upload Resume (PDF or DOCX)
          </label>
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setUploadSuccess(null);
              setResult(null);
            }}
            className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-bold file:text-black"
          />
          {file && (
            <p className="mt-2 text-sm text-slate-400">
              Selected: <span className="text-white">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Job Description */}
        <div>
          <label className="mb-2 block text-lg font-semibold">
            Job Description
          </label>
          <textarea
            rows="8"
            placeholder="Paste Job Description Here... (optional — upload alone to save resume)"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-white outline-none"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !file}
          className="w-full rounded-xl bg-cyan-400 px-6 py-4 text-lg font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {isUploading
            ? "Uploading & Parsing..."
            : isAnalyzing
            ? "Analyzing..."
            : "Upload & Analyze"}
        </button>

        {/* Loader */}
        {isLoading && <Loader />}

        {/* Upload success message */}
        {uploadSuccess && !result && (
          <div className="mt-4 rounded-2xl bg-green-500/10 p-5">
            <h3 className="mb-2 text-lg font-bold text-green-400">
              ✅ Resume Uploaded Successfully
            </h3>
            <p className="text-slate-300">
              File: <span className="font-semibold text-white">{uploadSuccess.originalFile}</span>
            </p>
            <p className="text-slate-300">
              Type: <span className="font-semibold text-white uppercase">{uploadSuccess.fileType}</span>
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Extracted {uploadSuccess.extractedText.length} characters of text.
            </p>
          </div>
        )}

        {/* Result */}
        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}

export default UploadSection;