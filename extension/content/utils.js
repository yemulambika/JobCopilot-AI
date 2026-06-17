/**
 * Shared utilities for all content scripts.
 * Provides skills extraction, MutationObserver helpers, and backend submission.
 */

// ─── Skills Database ───────────────────────────────────────
// Common technical skills to look for in job descriptions
const SKILLS_DB = [
  // Languages
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust",
  "swift", "kotlin", "ruby", "php", "scala", "r", "sql", "graphql",
  // Frontend
  "react", "angular", "vue", "svelte", "next.js", "nextjs", "nuxt", "html", "css",
  "tailwind", "bootstrap", "sass", "scss", "redux", "webpack", "vite",
  // Backend
  "node.js", "node", "express", "nestjs", "django", "flask", "fastapi",
  "spring", "rails", "laravel", "dotnet", "asp.net",
  // Databases
  "mongodb", "postgres", "postgresql", "mysql", "redis", "elasticsearch",
  "dynamodb", "firebase", "supabase", "sqlite", "cassandra",
  // Cloud
  "aws", "azure", "gcp", "google cloud", "ec2", "s3", "lambda",
  "cloudfront", "sqs", "sns",
  // DevOps
  "docker", "kubernetes", "terraform", "jenkins", "github actions",
  "circleci", "argocd", "helm", "istio", "prometheus", "grafana",
  // Testing
  "jest", "mocha", "chai", "cypress", "playwright", "selenium",
  "pytest", "junit", "vitest",
  // API
  "rest", "rest api", "grpc", "websocket", "kafka", "rabbitmq", "soap",
  // Auth
  "jwt", "oauth", "oauth2", "saml", "auth0", "passport",
  // AI/ML
  "machine learning", "ml", "deep learning", "nlp", "tensorflow", "pytorch",
  "langchain", "openai", "llm", "rag",
  // Mobile
  "react native", "flutter", "swiftui", "jetpack compose",
  // Tools
  "git", "github", "gitlab", "jira", "figma", "linux", "nginx",
  // Methodologies
  "agile", "scrum", "kanban", "ci/cd", "tdd", "microservices", "serverless",
];

/**
 * Extract skills from text using the skills database.
 * Returns sorted array of matched skills (deduplicated).
 */
function extractSkills(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set();

  for (const skill of SKILLS_DB) {
    // Use word boundary check for short skills, substring for longer ones
    if (skill.length <= 3) {
      // For short skills, use regex word boundary to avoid false positives
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lower)) {
        found.add(skill);
      }
    } else {
      if (lower.includes(skill)) {
        found.add(skill);
      }
    }
  }

  return Array.from(found).sort();
}

/**
 * Set up a MutationObserver that watches for DOM changes and
 * re-extracts job data when the page content changes.
 * Returns the observer so you can disconnect it later.
 */
function observeJobChanges(callback, options = {}) {
  const { debounceMs = 1000, target = document.body } = options;

  let timer = null;

  const observer = new MutationObserver((mutations) => {
    // Debounce: only fire once after rapid DOM changes settle
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      callback();
    }, debounceMs);
  });

  observer.observe(target, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return observer;
}

/**
 * Send extracted job data to the MERN backend.
 * Returns a promise with the response.
 */
async function sendToBackend(jobData) {
  const result = await chrome.storage.local.get(["apiUrl", "authToken"]);
  const apiUrl = result.apiUrl || "http://localhost:5000/api";
  const authToken = result.authToken || "";

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
      skills: jobData.skills,
      url: jobData.url,
    }),
  });

  return response.json();
}

/**
 * Try multiple selectors to find an element on the page.
 * Returns the first matching element or null.
 */
function queryFirst(selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim()) return el;
  }
  return null;
}

/**
 * Get text content from the first matching selector.
 */
function getText(selectors) {
  const el = queryFirst(selectors);
  return el ? el.textContent.trim() : "";
}

/**
 * Extract structured data from JSON-LD script tags.
 */
function getJsonLdData() {
  const scripts = document.querySelectorAll("script[type='application/ld+json']");
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      if (data?.description || data?.name || data?.title) return data;
      // Handle @graph format
      if (Array.isArray(data["@graph"])) {
        const jobPosting = data["@graph"].find(
          (item) => item["@type"] === "JobPosting"
        );
        if (jobPosting) return jobPosting;
      }
    } catch { /* skip invalid JSON */ }
  }
  return null;
}

// Make utilities available globally for content scripts
if (typeof window !== "undefined") {
  window.__ARM = {
    extractSkills,
    observeJobChanges,
    sendToBackend,
    getText,
    queryFirst,
    getJsonLdData,
    SKILLS_DB,
  };
}