/**
 * Simple Resume Improvement Engine
 *
 * Takes a resume text and a parsed job description, calculates the current ATS
 * score and generates suggestions to push the score toward a target (e.g., 92).
 *
 * This is a heuristic implementation – real‑world usage would involve LLMs.
 */

import { computeMatchScore } from "./matchResume";

export function improveResume(resumeText, jd) {
  const currentScore = computeMatchScore(resumeText, jd);
  const targetScore = 92;

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

  // Static suggestions for certifications and projects
  const certifications = ["AWS Certified Solutions Architect", "Google Cloud Professional"];
  const projectIdeas = [
    "Implemented a full‑stack web app using React and Node.js",
    "Built a CI/CD pipeline with GitHub Actions",
  ];

  // Simple bullet point strengthening (replace generic verbs)
  const strongerBullets = resumeText
    .split("\n")
    .map((line) => {
      if (/^[-*]\s/.test(line)) {
        return line.replace(/^[-*]\s/, "- Led ");
      }
      return line;
    })
    .join("\n");

  const improvements = [];

  if (missingSkills.length) {
    improvements.push(
      `Add missing required skills: ${missingSkills.join(", ")}.`
    );
  }
  improvements.push(
    `Consider adding relevant certifications such as ${certifications.join(
      " or "
    )}.`
  );
  improvements.push(
    `Add project descriptions like: ${projectIdeas.join(" ; ")}.`
  );
  improvements.push(
    "Rewrite generic bullet points to start with strong action verbs (e.g., 'Led', 'Implemented', 'Optimized')."
  );

  // Generate an improved resume by merging suggestions (very naive)
  const improvedResume = `${strongerBullets}\n\n--- Suggested Additions ---\n${improvements.join(
    "\n"
  )}`;

  return {
    currentScore,
    targetScore,
    improvements,
    improvedResume,
  };
}