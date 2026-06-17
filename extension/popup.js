/**
 * Popup script – runs when the user clicks the extension icon.
 * Extracts job details from the current active tab via content script,
 * then sends it to the background service worker for upload.
 * Does NOT auto‑navigate or scrape.
 */

document.getElementById("extractBtn").addEventListener("click", async () => {
  const statusEl = document.getElementById("status");
  statusEl.textContent = "⏳ Extracting...";
  statusEl.className = "status";

  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Ask content script to extract job data
    const response = await chrome.tabs.sendMessage(tab.id, { action: "extractJob" });

    if (!response || !response.success) {
      statusEl.textContent = "❌ Could not extract job details.";
      statusEl.className = "status error";
      return;
    }

    // Send job to background for upload
    const uploadResult = await chrome.runtime.sendMessage({
      action: "saveJob",
      job: response.job,
    });

    if (uploadResult && uploadResult.success) {
      statusEl.textContent = "✅ Job saved!";
      statusEl.className = "status success";
    } else {
      statusEl.textContent = `❌ Upload failed: ${uploadResult?.error || "Unknown error"}`;
      statusEl.className = "status error";
    }
  } catch (e) {
    statusEl.textContent = `❌ Error: ${e.message}`;
    statusEl.className = "status error";
  }
});