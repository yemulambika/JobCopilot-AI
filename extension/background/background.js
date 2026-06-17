/**
 * Background service worker for Chrome Extension.
 * Handles communication between content scripts, popup, and MERN backend.
 */

const DEFAULT_API_URL = "http://localhost:5000/api";

// Detect platform from URL
function detectPlatform(url) {
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("greenhouse.io")) return "greenhouse";
  if (url.includes("lever.co")) return "lever";
  if (url.includes("workday.com") || url.includes("myworkdayjobs.com")) return "workday";
  return null;
}

// Store last detected job
let lastDetectedJob = null;

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "job_detected") {
    lastDetectedJob = message.data;
    chrome.storage.local.set({ lastDetectedJob: message.data });
    updateBadge(sender.tab, message.data);
  }

  if (message.action === "extract_from_tab") {
    extractFromActiveTab().then((data) => sendResponse(data));
    return true;
  }

  if (message.action === "submit_to_backend") {
    submitToBackend(message.data).then((result) => sendResponse(result));
    return true;
  }

  if (message.action === "get_profile") {
    chrome.storage.local.get("profile", (result) => {
      sendResponse(result.profile || {});
    });
    return true;
  }

  if (message.action === "save_profile") {
    chrome.storage.local.set({ profile: message.profile }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === "get_settings") {
    chrome.storage.local.get(["apiUrl", "authToken"], (result) => {
      sendResponse({
        apiUrl: result.apiUrl || DEFAULT_API_URL,
        authToken: result.authToken || "",
      });
    });
    return true;
  }

  if (message.action === "autofill") {
    autofillActiveTab(message.profile).then((result) => sendResponse(result));
    return true;
  }

  if (message.action === "answer_question") {
    answerQuestion(message.data).then((result) => sendResponse(result));
    return true;
  }
});

// Update badge when on a job page
function updateBadge(tab, data) {
  if (data && (data.company || data.role)) {
    chrome.action.setBadgeText({ text: "JD", tabId: tab?.id });
    chrome.action.setBadgeBackgroundColor({ color: "#0891b2", tabId: tab?.id });
  }
}

// Extract job data from the active tab
async function extractFromActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return { success: false, error: "No active tab" };

  const platform = detectPlatform(tab.url);
  if (!platform) {
    return { success: false, error: "Not on a supported job platform" };
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "extract_job",
    });
    return { success: true, data: response.data };
  } catch (err) {
    // Content script may not be loaded yet
    return { success: false, error: "Content script not loaded. Try refreshing the page." };
  }
}

// Submit job data to MERN backend
async function submitToBackend(jobData) {
  const result = await chrome.storage.local.get(["apiUrl", "authToken"]);
  const apiUrl = result.apiUrl || DEFAULT_API_URL;
  const authToken = result.authToken || "";

  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    const response = await fetch(`${apiUrl}/extension/submit-job`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        company: jobData.company,
        role: jobData.role,
        source: jobData.platform,
        description: jobData.description,
        skills: jobData.skills || [],
        url: jobData.url,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return { success: false, error: err.error || "Submission failed" };
    }

    return { success: true, data: await response.json() };
  } catch (err) {
    return { success: false, error: "Cannot connect to backend. Is it running?" };
  }
}

/**
 * Send question to backend to generate an AI answer.
 */
async function answerQuestion(data) {
  const result = await chrome.storage.local.get(["apiUrl", "authToken"]);
  const apiUrl = result.apiUrl || DEFAULT_API_URL;
  const authToken = result.authToken || "";

  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    const response = await fetch(`${apiUrl}/extension/answer-question`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        question: data.question,
        resumeText: data.resumeText || "",
        jobDescription: data.jobDescription || "",
        companyName: data.companyName || "",
        roleName: data.roleName || "",
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return { success: false, error: err.error || "Answer generation failed" };
    }

    const resultData = await response.json();
    return { success: true, data: resultData };
  } catch (err) {
    return { success: false, error: "Cannot connect to backend. Is it running?" };
  }
}

// Autofill forms in active tab
async function autofillActiveTab(profile) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return { success: false, error: "No active tab" };

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "autofill",
      profile,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to autofill. Try refreshing the page." };
  }
}