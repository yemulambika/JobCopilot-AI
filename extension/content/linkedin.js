/**
 * LinkedIn job content script.
 * Uses MutationObserver to handle LinkedIn's SPA navigation.
 * Extracts job title, company, description, skills, and auto-sends to backend.
 */

(function () {
  "use strict";

  const { extractSkills, observeJobChanges, sendToBackend, getText, getJsonLdData } = window.__ARM;
  let lastUrl = "";

  /**
   * Extract job data from the current LinkedIn job page.
   */
  function extractLinkedInJob() {
    const data = {
      platform: "linkedin",
      url: window.location.href,
      company: "",
      role: "",
      description: "",
      skills: [],
    };

    // ─── Try JSON-LD first (most reliable) ────────────
    const jsonLd = getJsonLdData();
    if (jsonLd) {
      data.role = jsonLd.title || jsonLd.name || "";
      if (jsonLd.hiringOrganization?.name) {
        data.company = jsonLd.hiringOrganization.name;
      }
      if (jsonLd.description) {
        // Strip HTML tags
        data.description = jsonLd.description.replace(/<[^>]*>/g, " ").trim();
      }
    }

    // ─── Fallback: DOM selectors ──────────────────────
    if (!data.company) {
      data.company = getText([
        ".job-details-jobs-unified-top-card__company-name",
        ".jobs-unified-top-card__company-name",
        '[data-tracking-control-name="public_jobs_jobs-search-result-card"] span',
        '[class*="company-name"]',
        ".job-details-jobs-unified-top-card__company-link",
        ".jobs-company__box a",
      ]);
    }

    if (!data.role) {
      data.role = getText([
        ".job-details-jobs-unified-top-card__job-title",
        ".jobs-unified-top-card__job-title h1",
        "h1.job-details-jobs-unified-top-card__job-title",
        '[class*="job-title"] h1',
        "h1.t-24",
        "h1",
      ]);
    }

    if (!data.description) {
      const descEl =
        document.querySelector(".jobs-description__content") ||
        document.querySelector(".jobs-box__html-content") ||
        document.querySelector(".show-more-less-html__markup") ||
        document.querySelector("#job-details") ||
        document.querySelector('[class*="jobs-description"]') ||
        document.querySelector('[class*="description__text"]');

      if (descEl) data.description = descEl.innerText.trim();
    }

    // ─── Extract skills from description ──────────────
    data.skills = extractSkills(data.description);

    // Also extract from the skills section if present
    const skillsSectionEl = document.querySelectorAll(
      ".job-details-skill-match-status-list__item, [class*='skill-tag'], .skills-match-section"
    );
    if (skillsSectionEl.length > 0) {
      skillsSectionEl.forEach((el) => {
        const text = el.textContent.trim().toLowerCase();
        if (text && !data.skills.includes(text)) {
          data.skills.push(text);
        }
      });
    }

    return data;
  }

  /**
   * Handle extraction and auto-send.
   */
  function handleExtraction() {
    const data = extractLinkedInJob();
    if (data.company || data.role) {
      // Cache in storage
      chrome.storage.local.set({ lastDetectedJob: data });

      // Notify background + content to auto-send
      chrome.runtime.sendMessage({ action: "job_detected", data }).catch(() => {});

      console.log("🔍 LinkedIn job detected:", data.company, "/", data.role, "→", data.skills.length, "skills");
    }
  }

  // ─── Listen for messages from popup/background ──────
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extract_job") {
      const data = extractLinkedInJob();
      sendResponse({ success: true, data });
    }
    if (message.action === "autofill") {
      const { profile } = message;
      if (profile) autofillLinkedInForm(profile);
      sendResponse({ success: true });
    }
    return true;
  });

  /**
   * Autofill form fields on LinkedIn.
   */
  function autofillLinkedInForm(profile) {
    const fieldMappings = [
      { selectors: ['input[id*="name"]', 'input[aria-label*="name"]', 'input[name*="name"]'], value: profile.name || "" },
      { selectors: ['input[id*="email"]', 'input[aria-label*="email"]', 'input[type="email"]'], value: profile.email || "" },
      { selectors: ['input[id*="phone"]', 'input[aria-label*="phone"]', 'input[name*="phone"]'], value: profile.phone || "" },
      { selectors: ['textarea[id*="cover"]', 'textarea[aria-label*="cover"]', 'textarea[name*="cover"]'], value: profile.coverLetter || "" },
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

  // ─── Initial extraction (with delay for SPA) ────────
  setTimeout(handleExtraction, 2000);
  setTimeout(handleExtraction, 5000); // Second attempt for slow loads

  // ─── MutationObserver: watch for SPA navigation ─────
  observeJobChanges(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      setTimeout(handleExtraction, 1500); // Wait for new content to render
    }
  }, { debounceMs: 1500 });

  // ─── Popstate listener for browser back/forward ─────
  window.addEventListener("popstate", () => {
    setTimeout(handleExtraction, 1500);
  });

  console.log("✅ LinkedIn content script loaded");
})();