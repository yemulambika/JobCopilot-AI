/**
 * Content script – runs only on pages explicitly opened by the user.
 * Extracts basic job page metadata when the user triggers it via popup.
 * Does NOT scrape, crawl, or auto‑navigate.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractJob") {
    try {
      const title =
        document.querySelector("h1")?.innerText?.trim() ||
        document.title ||
        "";
      const company =
        document.querySelector('[class*="company"]')?.innerText?.trim() ||
        document.querySelector('[class*="employer"]')?.innerText?.trim() ||
        "";
      const location =
        document.querySelector('[class*="location"]')?.innerText?.trim() || "";
      const source = extractSource();
      const jd =
        document.querySelector('[class*="description"]')?.innerText?.trim() ||
        document.querySelector("main")?.innerText?.trim() ||
        "";
      const url = window.location.href;
      const salary = extractSalary();

      sendResponse({
        success: true,
        job: {
          title,
          company,
          location,
          source,
          jd,
          url,
          salary: salary || "",
          employmentType: "",
          postedDate: "",
        },
      });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
  }
  return true; // keep channel open for async response
});

function extractSource() {
  const host = window.location.hostname;
  if (host.includes("linkedin")) return "LinkedIn";
  if (host.includes("naukri")) return "Naukri";
  if (host.includes("wellfound") || host.includes("angellist")) return "Wellfound";
  if (host.includes("instahyre")) return "Instahyre";
  if (host.includes("cutshort")) return "Cutshort";
  if (host.includes("hirist")) return "Hirist";
  if (host.includes("greenhouse")) return "Greenhouse";
  if (host.includes("lever")) return "Lever";
  if (host.includes("myworkdayjobs")) return "Workday";
  if (host.includes("ycombinator")) return "Y Combinator";
  if (host.includes("remoteok")) return "Remote OK";
  if (host.includes("weworkremotely")) return "We Work Remotely";
  if (host.includes("foundit")) return "Foundit";
  if (host.includes("timesjobs")) return "TimesJobs";
  return "manual";
}

function extractSalary() {
  const el =
    document.querySelector('[class*="salary"]') ||
    document.querySelector('[class*="compensation"]');
  return el?.innerText?.trim() || "";
}