/**
 * Simple AI Job Matcher
 *
 * Given a resume text and a parsed job description (from parseJobDescription),
 * it calculates various match metrics.
 *
 * This is a heuristic implementation – in a real product you would replace
 * it with an LLM or more sophisticated model.
 */

import { computeMatchScore } from "./matchResume";

/**
 * @param {string} resumeText
 * @param {object} jd - parsed job description
 * @returns {object} match result
 */
export function matchJob(resumeText, jd) {
  // ATS score based on required skill overlap
  const atsScore = computeMatchScore(resumeText, jd);

  // Skill match is the same as ATS score for this simple version
  const skillMatch = atsScore;

  // Dummy experience and education match (70% if keywords found)
  const experienceMatch = resumeText.toLowerCase().includes("experience")
    ? 70
    : 0;
  const educationMatch = resumeText.toLowerCase().includes("education")
    ? 70
    : 0;

  // Missing required skills
  const required = (jd.requiredSkills || []).map((s) => s.toLowerCase());
  const resumeTokens = new Set(
    resumeText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
  const missingSkills = required.filter((skill) => !resumeTokens.has(skill));

  // Simple recommendations placeholder
  const recommendations = [
    "Highlight relevant projects",
    "Add quantifiable achievements",
    "Tailor summary to the role",
  ];

  return {
    atsScore,
    skillMatch,
    experienceMatch,
    educationMatch,
    missingSkills,
    recommendations,
  };
}