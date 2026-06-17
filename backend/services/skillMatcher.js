const skillsDatabase = require("../utils/skills");

/**
 * ─── NLP Tokenizer & Normalizer ────────────────────────────
 */

/**
 * Tokenize text into words (simple but effective NLP tokenizer).
 * Strips punctuation, lowercases, removes stop words.
 */
function tokenize(text) {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "shall", "can", "need",
    "dare", "ought", "used", "this", "that", "these", "those", "i", "me",
    "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
    "yours", "yourself", "he", "him", "his", "himself", "she", "her",
    "hers", "herself", "it", "its", "itself", "they", "them", "their",
    "theirs", "themselves", "what", "which", "who", "whom", "whose",
    "when", "where", "why", "how", "all", "each", "every", "both",
    "few", "more", "most", "other", "some", "such", "no", "nor", "not",
    "only", "own", "same", "so", "than", "too", "very", "just", "about",
    "above", "after", "again", "against", "between", "down", "during",
    "out", "over", "through", "under", "up", "if", "into", "like",
  ]);

  return text
    .toLowerCase()
    // Normalize common variants
    .replace(/react\.js/g, "react")
    .replace(/node\.js/g, "node")
    .replace(/express\.js/g, "express")
    .replace(/vue\.js/g, "vue")
    .replace(/next\.js/g, "nextjs")
    .replace(/\.net/g, "dotnet")
    .replace(/c\+\+/g, "cplusplus")
    .replace(/c\#/g, "csharp")
    // Remove punctuation except hyphens in compound words
    .replace(/[^a-z0-9\s\-]/g, " ")
    // Split into tokens
    .split(/\s+/)
    .filter((t) => t.length > 1 && !stopWords.has(t));
}

/**
 * Extract n-grams (2-word and 3-word phrases) from token array.
 */
function extractNGrams(tokens, minN = 2, maxN = 3) {
  const ngrams = [];
  for (let n = minN; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(" "));
    }
  }
  return ngrams;
}

/**
 * ─── Keyword Extraction (TF-inspired) ──────────────────────
 */

/**
 * Extract important keywords from text with frequency scoring.
 * Returns sorted array of { word, frequency, score } objects.
 */
function extractKeywords(text) {
  const tokens = tokenize(text);
  const ngrams = extractNGrams(tokens);

  // Count frequencies for single words
  const wordFreq = {};
  tokens.forEach((t) => {
    wordFreq[t] = (wordFreq[t] || 0) + 1;
  });

  // Count frequencies for bigrams/trigrams
  const phraseFreq = {};
  ngrams.forEach((p) => {
    phraseFreq[p] = (phraseFreq[p] || 0) + 1;
  });

  // Score single words (normalized by max frequency)
  const maxWordFreq = Math.max(...Object.values(wordFreq), 1);
  const wordScores = Object.entries(wordFreq).map(([word, freq]) => ({
    word,
    frequency: freq,
    score: Math.round((freq / maxWordFreq) * 100),
    type: "word",
  }));

  // Score phrases
  const maxPhraseFreq = Math.max(...Object.values(phraseFreq), 1);
  const phraseScores = Object.entries(phraseFreq).map(([phrase, freq]) => ({
    word: phrase,
    frequency: freq,
    score: Math.round((freq / maxPhraseFreq) * 100),
    type: "phrase",
  }));

  // Combine, sort by frequency desc
  return [...wordScores, ...phraseScores].sort(
    (a, b) => b.frequency - a.frequency
  );
}

/**
 * ─── Semantic Embedding via Xenova Transformers ────────────
 */

let embeddingPipeline = null;

/**
 * Lazy-load the embedding pipeline (loaded once, cached).
 */
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    try {
      const { pipeline } = await import("@xenova/transformers");
      // Use a lightweight model good for sentence similarity
      embeddingPipeline = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
      console.log("✅ AI embedding pipeline loaded (MiniLM)");
    } catch (err) {
      console.warn("⚠️  Embedding pipeline unavailable:", err.message);
      console.warn("   Falling back to algorithmic matching only.");
      return null;
    }
  }
  return embeddingPipeline;
}

/**
 * Compute cosine similarity between two embedding vectors.
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0,
    magA = 0,
    magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Compute semantic similarity between two texts using embeddings.
 * Returns a score from 0 to 1.
 */
async function computeSemanticSimilarity(textA, textB) {
  const pipe = await getEmbeddingPipeline();
  if (!pipe) return null; // Fallback: no embeddings available

  try {
    const [embA, embB] = await Promise.all([
      pipe(textA, { pooling: "mean", normalize: true }),
      pipe(textB, { pooling: "mean", normalize: true }),
    ]);

    const vecA = Array.from(embA.data);
    const vecB = Array.from(embB.data);

    return cosineSimilarity(vecA, vecB);
  } catch (err) {
    console.warn("⚠️  Embedding computation failed:", err.message);
    return null;
  }
}

/**
 * ─── ATS Scoring Engine ────────────────────────────────────
 */

/**
 * Normalize text for database skill matching.
 */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

/**
 * Enhanced skill matching with NLP preprocessing.
 *
 * @param {string} resumeText
 * @param {string} jdText
 * @returns {{
 *   score: number,
 *   matched: string[],
 *   missing: string[],
 *   resumeKeywords: object[],
 *   jdKeywords: object[],
 *   semanticScore: number|null,
 * }}
 */
async function getAdvancedScore(resumeText, jdText) {
  const resume = normalize(resumeText);
  const jd = normalize(jdText);

  // 1. Database skill matching (exact + partial)
  const jdSkills = skillsDatabase.filter((skill) => jd.includes(skill));
  const resumeSkills = skillsDatabase.filter((skill) => resume.includes(skill));

  // Partial matching: check if resume contains sub-strings of multi-word skills
  const jdWords = new Set(jd.split(/\s+/));
  const resumeWords = new Set(resume.split(/\s+/));

  // More aggressive matching: check individual words in multi-word skills
  const matchedSet = new Set();
  const missingSet = new Set();

  for (const skill of jdSkills) {
    const skillWords = skill.split(/\s+/);
    // Check if ALL words of the skill appear in resume
    const allWordsFound = skillWords.every((w) => resumeWords.has(w));
    if (allWordsFound) {
      matchedSet.add(skill);
    } else {
      missingSet.add(skill);
    }
  }

  // Also check database skills that might not be in JD but are in resume
  const extraResumeSkills = resumeSkills.filter((s) => !jdSkills.includes(s));

  const total = jdSkills.length;
  const matchScore = total === 0 ? 0 : Math.round((matchedSet.size / total) * 100);

  // 2. Extract keywords from both texts
  const resumeKeywords = extractKeywords(resumeText);
  const jdKeywords = extractKeywords(jdText);

  // 3. Compute semantic similarity
  const semanticScore = await computeSemanticSimilarity(resumeText, jdText);

  // 4. Final composite score (70% keyword match + 30% semantic)
  let finalScore = matchScore;
  if (semanticScore !== null) {
    finalScore = Math.round(matchScore * 0.7 + semanticScore * 100 * 0.3);
    // Clamp to 0-100
    finalScore = Math.max(0, Math.min(100, finalScore));
  }

  return {
    score: finalScore,
    matched: Array.from(matchedSet),
    missing: Array.from(missingSet),
    extraResumeSkills,
    resumeKeywords: resumeKeywords.slice(0, 30), // Top 30
    jdKeywords: jdKeywords.slice(0, 30),
    semanticScore: semanticScore !== null ? Math.round(semanticScore * 100) : null,
  };
}

/**
 * Legacy simple score (for backward compatibility).
 */
function getScore(resumeText, jdText) {
  const resume = normalize(resumeText);
  const jd = normalize(jdText);

  const jdSkills = skillsDatabase.filter((skill) => jd.includes(skill));
  const resumeSkills = skillsDatabase.filter((skill) => resume.includes(skill));

  const matched = jdSkills.filter((skill) => resumeSkills.includes(skill));
  const missing = jdSkills.filter((skill) => !resumeSkills.includes(skill));

  const total = jdSkills.length;
  const score = total === 0 ? 0 : Math.round((matched.length / total) * 100);

  return { score, matched, missing };
}

/**
 * Legacy extract skills (backward compatibility).
 */
function extractSkills(text) {
  const normalized = normalize(text);
  return skillsDatabase.filter((skill) => normalized.includes(skill));
}

module.exports = { getAdvancedScore, getScore, extractSkills, extractKeywords };