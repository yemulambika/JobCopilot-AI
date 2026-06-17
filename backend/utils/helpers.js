/**
 * Generate explanation lines based on ATS score.
 *
 * @param {number} score  - Final match score (0-100).
 * @param {string[]} matched - Skills that matched.
 * @param {string[]} missing - Skills that didn't match.
 * @returns {string[]}
 */
function generateExplanation(score, matched, missing) {
  if (score >= 90) {
    return [
      "🌟 Exceptional match! Your resume is highly aligned with this role.",
      `✅ Strong alignment: ${matched.length} required skills found in your resume.`,
      "You appear to be a top-tier candidate for this position.",
      "Your profile closely matches what the employer is looking for.",
    ];
  }

  if (score >= 70) {
    return [
      "👍 Strong candidate profile detected.",
      `✅ Matched ${matched.length} key skills from the job description.`,
      "Your resume aligns well with core job requirements.",
      "With minor adjustments, you could be an excellent fit.",
    ];
  }

  if (score >= 50) {
    return [
      "📊 Moderate alignment with job requirements.",
      `✅ Matched ${matched.length} skills: ${matched.slice(0, 5).join(", ")}${matched.length > 5 ? "..." : ""}`,
      `⚠️ Missing ${missing.length} skills that employers may look for.`,
      "Consider upskilling or highlighting transferable experience.",
    ];
  }

  if (score >= 30) {
    return [
      "🔄 Low compatibility with current job role.",
      `⚠️ Only ${matched.length} out of ${matched.length + missing.length} required skills detected.`,
      `Missing important skills: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "..." : ""}`,
      "Your resume needs stronger alignment with the job requirements.",
    ];
  }

  return [
    "❌ Very low match with this position.",
    `Only ${matched.length} matching skills found.`,
    `Critical missing skills: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "..." : ""}`,
    "Significant resume revision is recommended to target this role.",
  ];
}

/**
 * Generate strengths based on matched skills.
 */
function generateStrengths(matched) {
  if (matched.length === 0) {
    return ["No specific strengths detected for this role."];
  }

  const strengths = [];
  const categories = {
    frontend: ["react", "angular", "vue", "html", "css", "javascript", "typescript", "tailwind"],
    backend: ["node", "express", "django", "flask", "spring", "api", "rest"],
    database: ["mongodb", "postgresql", "mysql", "sql", "redis", "database"],
    cloud: ["aws", "azure", "gcp", "docker", "kubernetes", "terraform"],
    mobile: ["react native", "flutter", "swift", "kotlin"],
    devops: ["docker", "kubernetes", "jenkins", "ci/cd", "github actions"],
    ai: ["machine learning", "deep learning", "nlp", "tensorflow", "pytorch"],
    languages: ["javascript", "python", "java", "typescript", "go", "rust"],
  };

  for (const [category, skills] of Object.entries(categories)) {
    const found = matched.filter((s) => skills.includes(s));
    if (found.length >= 2) {
      strengths.push(`Strong ${category} skills: ${found.join(", ")}`);
    } else if (found.length === 1) {
      strengths.push(`Has ${category} experience: ${found[0]}`);
    }
  }

  if (strengths.length === 0) {
    strengths.push(`Matched skills: ${matched.slice(0, 5).join(", ")}`);
  }

  return strengths.slice(0, 5);
}

/**
 * Generate weak areas analysis based on missing skills.
 */
function generateWeakAreas(missing) {
  if (missing.length === 0) {
    return ["No significant weak areas detected — your resume covers all detected requirements."];
  }

  const weakAreas = [];
  const categories = {
    "Frontend Development": ["react", "angular", "vue", "html", "css", "javascript", "typescript", "tailwind"],
    "Backend Development": ["node", "express", "django", "flask", "spring", "api", "rest"],
    "Database & Storage": ["mongodb", "postgresql", "mysql", "sql", "redis", "database"],
    "Cloud Platforms": ["aws", "azure", "gcp", "cloud", "docker", "kubernetes"],
    "DevOps & CI/CD": ["docker", "kubernetes", "jenkins", "ci/cd", "github actions", "terraform"],
    "AI & Machine Learning": ["machine learning", "deep learning", "nlp", "tensorflow", "pytorch"],
    "Programming Languages": ["javascript", "python", "java", "typescript", "go", "rust", "c++"],
    "Testing": ["jest", "cypress", "playwright", "testing", "pytest"],
    "Mobile Development": ["react native", "flutter", "swift", "kotlin", "android", "ios"],
  };

  for (const [area, skills] of Object.entries(categories)) {
    const found = missing.filter((s) => skills.includes(s));
    if (found.length >= 2) {
      weakAreas.push({ area, skills: found, severity: found.length >= 4 ? "high" : "medium" });
    } else if (found.length === 1) {
      weakAreas.push({ area, skills: found, severity: "low" });
    }
  }

  if (weakAreas.length === 0) {
    const uncategorized = missing.slice(0, 3);
    weakAreas.push({
      area: "General Skills",
      skills: uncategorized,
      severity: "medium",
    });
  }

  return weakAreas.sort((a, b) => {
    const severityMap = { high: 3, medium: 2, low: 1 };
    return severityMap[b.severity] - severityMap[a.severity];
  });
}

/**
 * Generate actionable suggestions for improvement.
 *
 * @param {string[]} missing
 * @param {object[]} weakAreas
 * @returns {string[]}
 */
function generateSuggestions(missing, weakAreas = []) {
  if (missing.length === 0) {
    return [
      "✅ Your resume is well aligned with this job description!",
      "Consider quantifying your achievements with metrics (e.g., 'increased performance by 30%').",
      "Keep your resume updated with your latest accomplishments.",
    ];
  }

  const suggestions = [];

  // Category-specific suggestions
  if (missing.some((s) => ["react", "angular", "vue", "svelte"].includes(s))) {
    suggestions.push("💡 Add a personal project using " +
      missing.find((s) => ["react", "angular", "vue", "svelte"].includes(s)) + " to showcase frontend skills.");
  }
  if (missing.some((s) => ["docker", "kubernetes", "terraform"].includes(s))) {
    suggestions.push("🔧 Gain hands-on experience with " +
      missing.find((s) => ["docker", "kubernetes", "terraform"].includes(s)) +
      " — consider a quick certification or tutorial project.");
  }
  if (missing.some((s) => ["aws", "azure", "gcp"].includes(s))) {
    suggestions.push("☁️ Cloud skills are in high demand. Try adding a " +
      missing.find((s) => ["aws", "azure", "gcp"].includes(s)) + " certification to your resume.");
  }
  if (missing.some((s) => ["machine learning", "deep learning", "nlp", "tensorflow", "pytorch"].includes(s))) {
    suggestions.push("🤖 AI/ML experience is increasingly valued. Consider a course or project in " +
      missing.find((s) => ["machine learning", "deep learning", "nlp", "tensorflow", "pytorch"].includes(s)) + ".");
  }
  if (missing.some((s) => ["jest", "cypress", "playwright", "testing"].includes(s))) {
    suggestions.push("🧪 Add testing skills (" +
      missing.find((s) => ["jest", "cypress", "playwright", "testing"].includes(s)) +
      ") to demonstrate commitment to code quality.");
  }

  // Generic suggestions based on weak areas
  if (weakAreas.length > 0) {
    const highSeverity = weakAreas.filter((w) => w.severity === "high");
    if (highSeverity.length > 0) {
      suggestions.push(
        `📈 Priority: Address your gaps in ${highSeverity.map((w) => w.area).join(", ")} ` +
        `by adding relevant projects or experience.`
      );
    }

    const mediumSeverity = weakAreas.filter((w) => w.severity === "medium");
    if (mediumSeverity.length > 0) {
      suggestions.push(
        `📚 Consider upskilling in: ${mediumSeverity.map((w) => w.area).join(", ")}.`
      );
    }
  }

  // Always include meta suggestions
  suggestions.push("📝 Use bullet points with metrics to highlight achievements (e.g., 'Led team of 5').");
  suggestions.push("🎯 Tailor your professional summary to match keywords from the job description.");
  suggestions.push("🔍 Review the job description and incorporate relevant keywords naturally into your experience.");

  return suggestions.slice(0, 6);
}

module.exports = { generateExplanation, generateStrengths, generateWeakAreas, generateSuggestions };