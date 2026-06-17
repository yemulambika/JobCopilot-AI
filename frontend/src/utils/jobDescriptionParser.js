/**
 * Smart Job Description Parser
 *
 * Extracts structured information from a raw job description text.
 * Uses a hybrid approach: regex patterns for common sections and
 * fallback simple AI‑like heuristics (keyword scoring) for ambiguous parts.
 *
 * Returned object shape:
 * {
 *   company: string | null,
 *   role: string | null,
 *   requiredSkills: string[] | null,
 *   preferredSkills: string[] | null,
 *   experience: string | null,
 *   salary: string | null,
 *   location: string | null
 * }
 */

export const DEFAULT_SKILL_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "node",
  "python",
  "java",
  "c#",
  "c++",
  "aws",
  "azure",
  "gcp",
  "docker",
  "kubernetes",
  "sql",
  "nosql",
  "git",
  "rest",
  "graphql",
  "html",
  "css",
  "sass",
  "tailwind",
  "redux",
  "microservices",
  "linux",
  "windows",
];

/**
 * Helper to extract a single line/value using a regex.
 */
function extractSingle(regex, text) {
  const match = regex.exec(text);
  return match ? match[1].trim() : null;
}

/**
 * Helper to extract a list of items separated by commas, semicolons or newlines.
 */
function extractList(regex, text) {
  const match = regex.exec(text);
  if (!match) return null;
  const raw = match[1];
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Main parser function.
 *
 * @param {string} description Raw job description text.
 * @returns {object} Parsed fields.
 */
export function parseJobDescription(description) {
  if (!description) {
    return {
      company: null,
      role: null,
      requiredSkills: null,
      preferredSkills: null,
      experience: null,
      salary: null,
      location: null,
    };
  }

  const text = description.replace(/\r\n/g, "\n"); // normalize line endings

  // 1️⃣ Company – look for patterns like "Company: XYZ" or "About XYZ"
  const company =
    extractSingle(/(?:Company|Employer|About)\s*[:\-]\s*([^\n]+)/i, text) ||
    extractSingle(/^([A-Z][A-Za-z0-9&\s]+)\s+is\s+looking/i, text) ||
    null;

  // 2️⃣ Role / Title
  const role =
    extractSingle(/(?:Title|Position|Role)\s*[:\-]\s*([^\n]+)/i, text) ||
    extractSingle(/^We\s+are\s+looking\s+for\s+([^\n]+)\s+to/i, text) ||
    null;

  // 3️⃣ Required Skills – often under headings like "Requirements", "Must have"
  const requiredSkills =
    extractList(
      /(?:Requirements|Must have|Required skills?)\s*[:\-]\s*([\s\S]*?)(?:\n\n|$)/i,
      text
    ) ||
    // fallback: look for bullet list after "Requirements"
    extractList(
      /Requirements\s*[:\-]?\s*\n([\s\S]*?)(?:\n\n|$)/i,
      text
    ) ||
    null;

  // 4️⃣ Preferred Skills – headings like "Preferred", "Nice to have"
  const preferredSkills =
    extractList(
      /(?:Preferred|Nice to have|Desired skills?)\s*[:\-]\s*([\s\S]*?)(?:\n\n|$)/i,
      text
    ) ||
    null;

  // 5️⃣ Experience – look for years of experience patterns
  const experience = extractSingle(
    /(?:Experience|Years of experience)\s*[:\-]\s*([^\n]+)/i,
    text
  );

  // 6️⃣ Salary – capture typical salary formats
  const salary = extractSingle(
    /(?:Salary|Compensation)\s*[:\-]\s*([\$\d,.]+(?:\s*-\s*[\$\d,.]+)?)/i,
    text
  );

  // 7️⃣ Location – city, state, remote etc.
  const location = extractSingle(
    /(?:Location|Based in)\s*[:\-]\s*([^\n]+)/i,
    text
  );

  // ---------- Heuristic fallback for skills ----------
  // If required or preferred skills are missing, scan the whole text for known keywords.
  function inferSkills(section) {
    const found = [];
    const lowered = text.toLowerCase();
    DEFAULT_SKILL_KEYWORDS.forEach((kw) => {
      const pattern = new RegExp(`\\b${kw}\\b`, "i");
      if (pattern.test(lowered)) {
        found.push(kw);
      }
    });
    return found.length ? found : null;
  }

  const finalRequired = requiredSkills || inferSkills("required");
  const finalPreferred = preferredSkills || inferSkills("preferred");

  return {
    company,
    role,
    requiredSkills: finalRequired,
    preferredSkills: finalPreferred,
    experience,
    salary,
    location,
  };
}