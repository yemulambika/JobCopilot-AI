/**
 * Workday job content script.
 * Uses MutationObserver for dynamic page changes.
 * Extracts job title, company, description, skills.
 */

(function () {
  "use strict";

  const { extractSkills, observeJobChanges, getText, getJsonLdData } = window.__ARM;
  let lastUrl = "";

  function extractWorkdayJob() {
    const data = {
      platform: "workday",
      url: window.location.href,
      company: "",
      role: "",
      description: "",
      skills: [],
    };

    // JSON-LD first
    const jsonLd = getJsonLdData();
    if (jsonLd) {
      data.role = jsonLd.title || jsonLd.name || "";
      data.company = jsonLd.hiringOrganization?.name || "";
      if (jsonLd.description) {
        data.description = jsonLd.description.replace(/<[^>]*>/g, " ").trim();
      }
    }

    if (!data.company) {
      data.company = getText([
        '[data-automation-id="companyName"]',
        '[class*="company-name"]',
        '[class*="companyName"]',
        'span[class*="company"]',
        ".WHEdge16 span",
      ]);
    }

    if (!data.role) {
      data.role = getText([
        '[data-automation-id="jobTitle"]',
        '[class*="job-title"]',
        '[class*="jobTitle"]',
        "h1",
      ]);
    }

    if (!data.description) {
      const descEl =
        document.querySelector('[data-automation-id="jobPostingDescription"]') ||
        document.querySelector('[class*="description__text"]') ||
        document.querySelector('[class*="job-description"]');

      if (descEl) {
        data.description = descEl.innerText.trim();
      }
    }

    data.skills = extractSkills(data.description);
    return data;
  }

  function handleExtraction() {
    const data = extractWorkdayJob();
    if (data.company || data.role) {
      chrome.storage.local.set({ lastDetectedJob: data });
      chrome.runtime.sendMessage({ action: "job_detected", data }).catch(() => {});
      console.log("🔍 Workday job detected:", data.company, "/", data.role, "→", data.skills.length, "skills");
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extract_job") {
      sendResponse({ success: true, data: extractWorkdayJob() });
    }
    if (message.action === "autofill") {
      autofillWorkdayForm(message.profile);
      sendResponse({ success: true });
    }
    return true;
  });

  function autofillWorkdayForm(profile) {
    const fieldMappings = [
      { selectors: ['input[data-automation-id="firstName"]', 'input[name*="first_name"]'], value: profile.firstName || "" },
      { selectors: ['input[data-automation-id="lastName"]', 'input[name*="last_name"]'], value: profile.lastName || "" },
      { selectors: ['input[data-automation-id="email"]', 'input[type="email"]'], value: profile.email || "" },
      { selectors: ['input[data-automation-id="phone"]', 'input[name*="phone"]'], value: profile.phone || "" },
      { selectors: ['textarea[data-automation-id="cover"]', 'textarea[name*="cover"]'], value: profile.coverLetter || "" },
    ];
    fieldMappings.forEach(({ selectors, value }) => {
      if (!value) return;
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          break;
        }
      }
    });
  }

  // Initial extraction
  setTimeout(handleExtraction, 2000);

  // MutationObserver for SPA navigation
  observeJobChanges(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      setTimeout(handleExtraction, 1500);
    }
  }, { debounceMs: 1500 });

  window.addEventListener("popstate", () => setTimeout(handleExtraction, 1500));

  console.log("✅ Workday content script loaded");
})();