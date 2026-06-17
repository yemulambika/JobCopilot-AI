/**
 * Background service worker (Manifest V3)
 * Handles JWT authentication and forwards collected jobs to the backend.
 * Never scrapes or auto‑navigates.
 */

const API_BASE = "https://ai-resume-backend-1i32.onrender.com/api";

// Retrieve stored JWT
async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["jwt"], (result) => {
      resolve(result.jwt || null);
    });
  });
}

// Send a job to the backend
async function sendJob(job) {
  const token = await getToken();
  if (!token) {
    console.warn("[Background] No JWT found – skipping upload.");
    return { success: false, error: "Not authenticated" };
  }

  try {
    const resp = await fetch(`${API_BASE}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(job),
    });
    return await resp.json();
  } catch (e) {
    console.error("[Background] Upload failed:", e.message);
    return { success: false, error: e.message };
  }
}

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveJob") {
    sendJob(request.job).then((result) => {
      sendResponse(result);
    });
    return true; // keep channel open for async
  }
});

// On extension install – initialize storage
chrome.runtime.onInstalled.addListener(() => {
  console.log("[Background] AI Job Assistant installed.");
});