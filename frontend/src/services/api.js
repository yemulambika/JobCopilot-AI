import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send cookies for refresh token
});

// ─── Token helpers ─────────────────────────────────────────

let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// ─── Request interceptor — attach access token ─────────────

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — auto-refresh on 401 ────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.expired &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/register")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ──────────────────────────────────────────────

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const logoutUser = () => api.post("/auth/logout");
export const getMe = () => api.get("/auth/me");

// ─── Resume API ────────────────────────────────────────────

/**
 * Upload and parse a PDF or DOCX resume.
 * @param {File} file
 */
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return api.post("/resumes/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * Get all resumes for the current user.
 */
export const getResumes = () => api.get("/resumes");

/**
 * Get a single resume by ID (with full extracted text).
 * @param {string} id
 */
export const getResumeById = (id) => api.get(`/resumes/${id}`);

/**
 * Delete a resume by ID.
 * @param {string} id
 */
export const deleteResume = (id) => api.delete(`/resumes/${id}`);

/**
 * Legacy: match resume text against a job description.
 * @param {string} resumeText
 * @param {string} jobDescription
 */
export const matchResume = (resumeText, jobDescription) => {
  return api.post("/match", { resumeText, jobDescription });
};

// ─── AI API (Gemini) ───────────────────────────────────────

/**
 * Generate a custom AI response.
 * @param {string} prompt
 * @param {object} [options]
 */
export const generateAI = (prompt, options = {}) => {
  return api.post("/ai/generate", { prompt, ...options });
};

/**
 * Analyze a resume with AI (with or without job description).
 * @param {string} resumeText
 * @param {string} [jobDescription]
 */
export const analyzeResumeAI = (resumeText, jobDescription) => {
  return api.post("/ai/analyze-resume", { resumeText, jobDescription });
};

/**
 * Generate a cover letter using AI.
 * @param {string} resumeText
 * @param {string} jobDescription
 * @param {string} [tone]
 */
export const generateCoverLetter = (resumeText, jobDescription, tone) => {
  return api.post("/ai/cover-letter", { resumeText, jobDescription, tone });
};

// ─── Tailoring API ─────────────────────────────────────────

/**
 * Tailor a resume to a specific job description.
 * @param {string} masterResumeText
 * @param {string} jobDescription
 * @param {string} [resumeId]
 */
export const tailorResume = (masterResumeText, jobDescription, resumeId) => {
  return api.post("/tailor", { masterResumeText, jobDescription, resumeId });
};

/**
 * Get all tailored resumes for the current user.
 */
export const getTailoredResumes = () => api.get("/tailor");

/**
 * Get a single tailored resume by ID.
 * @param {string} id
 */
export const getTailoredResumeById = (id) => api.get(`/tailor/${id}`);

/**
 * Delete a tailored resume by ID.
 * @param {string} id
 */
export const deleteTailoredResume = (id) => api.delete(`/tailor/${id}`);

// ─── Cover Letter API ──────────────────────────────────────

/**
 * Generate a cover letter with AI.
 * @param {string} resumeText
 * @param {string} jobDescription
 * @param {string} [tone]
 * @param {string} [resumeId]
 */
export const generateCoverLetterAI = (resumeText, jobDescription, tone, resumeId) => {
  return api.post("/cover-letters/generate", {
    resumeText,
    jobDescription,
    tone,
    resumeId,
  });
};

/**
 * Get all cover letters for the current user.
 */
export const getCoverLetters = () => api.get("/cover-letters");

/**
 * Get a single cover letter by ID.
 * @param {string} id
 */
export const getCoverLetterById = (id) => api.get(`/cover-letters/${id}`);

/**
 * Delete a cover letter by ID.
 * @param {string} id
 */
export const deleteCoverLetter = (id) => api.delete(`/cover-letters/${id}`);

// ─── Export / PDF Download API ─────────────────────────────

/**
 * Download a tailored resume as PDF.
 * @param {string} id - Tailored resume ID
 */
export const downloadTailoredResumePDF = (id) => {
  return api.get(`/export/tailored-resume/${id}/pdf`, {
    responseType: "blob",
  });
};

/**
 * Download a cover letter as PDF.
 * @param {string} id - Cover letter ID
 */
export const downloadCoverLetterPDF = (id) => {
  return api.get(`/export/cover-letter/${id}/pdf`, {
    responseType: "blob",
  });
};

// ─── Job Tracker API ───────────────────────────────────────

/**
 * Get all job applications.
 */
export const getJobs = () => api.get("/jobs");

/**
 * Create a new job application.
 * @param {object} data - { company, role, source, status, appliedDate, notes }
 */
export const createJob = (data) => api.post("/jobs", data);

/**
 * Update a job application.
 * @param {string} id
 * @param {object} data
 */
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);

/**
 * Update job status only (for drag-and-drop).
 * @param {string} id
 * @param {string} status
 */
export const updateJobStatus = (id, status) =>
  api.patch(`/jobs/${id}/status`, { status });

/**
 * Delete a job application.
 * @param {string} id
 */
export const deleteJob = (id) => api.delete(`/jobs/${id}`);

// ─── Skill Gap Analysis API ────────────────────────────────

/**
 * Analyze skill gap between resume and job description.
 * @param {string} resumeText
 * @param {string} jobDescription
 */
export const analyzeSkillGap = (resumeText, jobDescription) => {
  return api.post("/skill-gap/analyze", { resumeText, jobDescription });
};

// ─── Email API ─────────────────────────────────────────────

/**
 * Generate an AI email.
 * @param {object} params — { emailType, tone, recipientName, companyName, jobTitle, jobDescription, resumeText, resumeId }
 */
export const generateEmailAI = (params) => {
  return api.post("/emails/generate", params);
};

/**
 * Get all emails for the current user.
 */
export const getEmails = () => api.get("/emails");

/**
 * Get a single email by ID.
 * @param {string} id
 */
export const getEmailById = (id) => api.get(`/emails/${id}`);

/**
 * Delete an email by ID.
 * @param {string} id
 */
export const deleteEmail = (id) => api.delete(`/emails/${id}`);

// ─── Career Insights API ──────────────────────────────────

/**
 * Generate AI career insights from resume text.
 * @param {string} resumeText
 * @param {string} [targetRole]
 * @param {string} [targetIndustry]
 */
export const getCareerInsights = (resumeText, targetRole, targetIndustry) => {
  return api.post("/career-insights/analyze", { resumeText, targetRole, targetIndustry });
};

// ─── Admin Dashboard API ──────────────────────────────────

/**
 * Get admin dashboard statistics.
 */
export const getAdminDashboard = () => api.get("/admin/dashboard");

// ─── Resume Versioning API ────────────────────────────────

/**
 * Get all resume versions (optionally by master resume ID).
 * @param {string} [masterResumeId]
 */
export const getResumeVersions = (masterResumeId) => {
  const params = masterResumeId ? { masterResumeId } : {};
  return api.get("/resume-versions", { params });
};

/**
 * Get a single resume version with full content.
 * @param {string} id
 */
export const getResumeVersionById = (id) => api.get(`/resume-versions/${id}`);

/**
 * Create a new resume version.
 * @param {object} data — { masterResumeId?, label?, type, content, jobDescription?, metadata? }
 */
export const createResumeVersion = (data) => api.post("/resume-versions", data);

/**
 * Restore a version as the active one.
 * @param {string} id
 */
export const restoreResumeVersion = (id) => api.patch(`/resume-versions/${id}/restore`);

/**
 * Compare two versions.
 * @param {string} versionA — version ID
 * @param {string} versionB — version ID
 */
export const compareResumeVersions = (versionA, versionB) =>
  api.get("/resume-versions/compare", { params: { versionA, versionB } });

/**
 * Download a version as plain text file.
 * @param {string} id
 */
export const downloadResumeVersion = (id) =>
  api.get(`/resume-versions/${id}/download`, { responseType: "blob" });

/**
 * Delete a resume version.
 * @param {string} id
 */
export const deleteResumeVersion = (id) => api.delete(`/resume-versions/${id}`);

export default api;
