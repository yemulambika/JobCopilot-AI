/**
 * AI Keyword Optimizer
 *
 * Given a resume text and a parsed job description (from parseJobDescription),
 * it identifies missing required keywords, suggests where they could be added,
 * and computes a simple ATS impact score.
 *
 * The optimizer is heuristic – it looks for requiredSkills that are not present
 * in the resume and suggests common sections (Summary, Experience, Skills) for
 * insertion. The ATS impact score is the percentage of required skills present.
 */

import { DEFAULT_SKILL_KEYWORDS } from "./jobDescriptionParser";

/**
 * Helper to extract all words from a text (lower‑cased).
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Main optimizer function.
 *
 * @param {string} resumeText   Full resume content.
 * @param {object} jd          Parsed job description object.
 * @returns {object} {
 *   missingKeywords: string[],
 *   suggestions: { keyword: string, section: string }[],
 *   atsImpactScore: number   // 0‑100
 * }
 */
export function optimizeResume(resumeText, jd) {
  if (!resumeText || !jd) {
    return {
      missingKeywords: [],
      suggestions: [],
      atsImpactScore: 0,
    };
  }

  const resumeTokens = new Set(tokenize(resumeText));
  const required = (jd.requiredSkills || []).map((s) => s.toLowerCase());

  // Determine which required skills are missing
  const missingKeywords = required.filter((skill) => !resumeTokens.has(skill));

  // Simple heuristic for placement suggestions
  const sections = ["Summary", "Professional Experience", "Skills", "Projects"];
  const suggestions = missingKeywords.map((kw) => ({
    keyword: kw,
    section: sections[Math.floor(Math.random() * sections.length)],
  }));

  const presentCount = required.length - missingKeywords.length;
  const atsImpactScore = required.length
    ? Math.round((presentCount / required.length) * 100)
    : 0;

  return {
    missingKeywords,
    suggestions,
    atsImpactScore,
  };
}