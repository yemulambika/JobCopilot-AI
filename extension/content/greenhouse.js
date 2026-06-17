/**
 * Greenhouse job content script.
 * Uses MutationObserver for dynamic page changes.
 * Extracts job title, company, description, skills.
 */

(function () {
  "use strict";

  const { extractSkills, observeJobChanges, getText, getJsonLdData } = window.__ARM;
  let lastUrl = "";

  function extractGreenhouseJob() {
    const data = {
      platform: "greenhouse",
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
        'meta[property="og:title"]', // parse from "Company - Role"
        "#header-company-name",
        ".company-name",
        '[class*="company-name"]',
      ]);
      // Clean company name from og:title format "Company - Role"
      if (data.company.includes(" - ")) {
        data.company = data.company.split(" - ")[0].trim();
      }
    }

    if (!data.role) {
      data.role = getText([
        ".app-title",
        "#header-job-title",
        '[class*="job-title"]',
        "h1",
      ]);
    }

    if (!data.description) {
      const descEl =
        document.querySelector("#content") ||
        document.querySelector('[class*="job-description"]') ||
        document.querySelector('[class*="description"]') ||
        document.querySelector(".job-body") ||
        document.querySelector("main");

      if (descEl) data.description = descEl.innerText.trim();
    }

    data.skills = extractSkills(data.description);
    return data;
  }

  function handleExtraction() {
    const data = extractGreenhouseJob();
    if (data.company || data.role) {
      chrome.storage.local.set({ lastDetectedJob: data });
      chrome.runtime.sendMessage({ action: "job_detected", data }).catch(() => {});
      console.log("🔍 Greenhouse job detected:", data.company, "/", data.role, "→", data.skills.length, "skills");
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extract_job") {
      sendResponse({ success: true, data: extractGreenhouseJob() });
    }
    if (message.action === "autofill") {
      autofillGreenhouseForm(message.profile);
      sendResponse({ success: true });
    }
    return true;
  });

  function autofillGreenhouseForm(profile) {
    const fieldMappings = [
      { selectors: ['input[name*="first_name"]', 'input[id*="first_name"]'], value: profile.firstName || "" },
      { selectors: ['input[name*="last_name"]', 'input[id*="last_name"]'], value: profile.lastName || "" },
      { selectors: ['input[name*="email"]', 'input[id*="email"]', 'input[type="email"]'], value: profile.email || "" },
      { selectors: ['input[name*="phone"]', 'input[id*="phone"]'], value: profile.phone || "" },
      { selectors: ['textarea[name*="cover"]', 'textarea[id*="cover"]'], value: profile.coverLetter || "" },
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

  console.log("✅ Greenhouse content script loaded");
})();