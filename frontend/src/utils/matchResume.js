/**
 * Simple resume matching utility.
 *
 * Given a resume text and a job description object (as returned by
 * parseJobDescription), it computes a basic relevance score based on
 * keyword overlap between required skills and the resume content.
 *
 * Returns a number between 0 and 100.
 */
export function computeMatchScore(resumeText, jd) {
  if (!resumeText || !jd) return 0;

  const resume = resumeText.toLowerCase();
  const required = (jd.requiredSkills || []).map((s) => s.toLowerCase());

  if (required.length === 0) return 0;

  let matches = 0;
  required.forEach((skill) => {
    if (resume.includes(skill)) matches += 1;
  });

  return Math.round((matches / required.length) * 100);
}