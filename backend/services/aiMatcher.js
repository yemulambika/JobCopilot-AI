const { pipeline } = require("@xenova/transformers");

let embedder;

/**
 * Lazy-load the embedding model.
 */
async function loadModel() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedder;
}

/**
 * Compute cosine similarity between two vectors.
 */
function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Compute semantic similarity score between resume and job description.
 *
 * @param {string} resume - Resume text.
 * @param {string} jd     - Job description text.
 * @returns {Promise<number>} Score 0–100.
 */
async function getSemanticScore(resume, jd) {
  const model = await loadModel();

  const resEmbedding = await model(resume, {
    pooling: "mean",
    normalize: true,
  });
  const jdEmbedding = await model(jd, {
    pooling: "mean",
    normalize: true,
  });

  const score = cosineSimilarity(
    Array.from(resEmbedding.data),
    Array.from(jdEmbedding.data)
  );

  return Math.round(score * 100);
}

module.exports = { getSemanticScore };