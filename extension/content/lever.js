/**
 * Lever job content script.
 * Uses MutationObserver for dynamic page changes.
 * Extracts job title, company, description, skills.
 */

(function () {
  "use strict";

  const { extractSkills, observeJobChanges, getText, getJsonLdData } = window.__ARM;
  let lastUrl = "";

  function extractLeverJob() {
    const data = {
      platform: "lever",
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
        ".posting-headline .company",
        ".posting-headline a.company",
        '[class*="company-name"]',
        ".main-header-text",
      ]);
    }

    if (!data.role) {
      data.role = getText([
        ".posting-headline h2",
        "h2.posting-name",
        "h1",
      ]);
    }

    if (!data.description) {
      const descEl =
        document.querySelector(".posting-page") ||
        document.querySelector('[class*="description"]') ||
        document.querySelector('[class*="posting"]') ||
        document.querySelector("main") ||
        document.querySelector(".content");

      if (descEl) data.description = descEl.innerText.trim();
    }

    data.skills = extractSkills(data.description);
    return data;
  }

  function handleExtraction() {
    const data = extractLeverJob();
    if (data.company || data.role) {
      chrome.storage.local.set({ lastDetectedJob: data });
      chrome.runtime.sendMessage({ action: "job_detected", data }).catch(() => {});
      console.log("🔍 Lever job detected:", data.company, "/", data.role, "→", data.skills.length, "skills");
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extract_job") {
      sendResponse({ success: true, data: extractLeverJob() });
    }
    if (message.action === "autofill") {
      autofillLeverForm(message.profile);
      sendResponse({ success: true });
    }
    return true;
  });

  function autofillLeverForm(profile) {
    const fieldMappings = [
      { selectors: ['input[name*="name"]', 'input[id*="name"]', 'input[placeholder*="Name"]'], value: profile.name || "" },
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

  console.log("✅ Lever content script loaded");
})();