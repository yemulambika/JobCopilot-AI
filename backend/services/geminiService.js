const { GoogleGenerativeAI } = require("@google/generative-ai");

// ─── Configuration ─────────────────────────────────────────

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";

if (!API_KEY) {
  console.warn(
    "⚠️  GEMINI_API_KEY is not set. Gemini AI features will not work."
  );
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// ─── Rate limiting (in-memory) ─────────────────────────────

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per user

function checkRateLimit(userId) {
  const now = Date.now();
  const userKey = userId || "anonymous";

  if (!rateLimitMap.has(userKey)) {
    rateLimitMap.set(userKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  const entry = rateLimitMap.get(userKey);

  // Reset window if expired
  if (now > entry.resetAt) {
    rateLimitMap.set(userKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count };
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ─── Core AI function ──────────────────────────────────────

/**
 * Generate an AI response using Google Gemini.
 *
 * @param {string} prompt        — The user prompt.
 * @param {object} [options]     — Optional configuration.
 * @param {string} [options.userId] — Used for rate limiting.
 * @param {string} [options.systemInstruction] — System-level prompt.
 * @param {number} [options.maxOutputTokens]   — Max tokens (default 2048).
 * @param {number} [options.temperature]       — Temperature (default 0.7).
 * @returns {Promise<{ text: string, usage: object }>}
 */
async function generateAIResponse(prompt, options = {}) {
  const {
    userId = null,
    systemInstruction = "",
    maxOutputTokens = 2048,
    temperature = 0.7,
  } = options;

  // ── Guard: API key configured ──
  if (!genAI) {
    throw new Error("Gemini API is not configured. Set GEMINI_API_KEY.");
  }

  // ── Rate limit ──
  const rateLimit = checkRateLimit(userId);
  if (!rateLimit.allowed) {
    const error = new Error(
      `Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`
    );
    error.statusCode = 429;
    error.retryAfter = rateLimit.retryAfter;
    throw error;
  }

  // ── Validate prompt ──
  if (!prompt || typeof prompt !== "string") {
    throw new Error("A valid prompt string is required.");
  }

  if (prompt.trim().length === 0) {
    throw new Error("Prompt cannot be empty.");
  }

  try {
    const modelOptions = {
      model: MODEL_NAME,
      ...(systemInstruction ? { systemInstruction } : {}),
      generationConfig: {
        maxOutputTokens,
        temperature,
      },
    };

    const model = genAI.getGenerativeModel(modelOptions);

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const durationMs = Date.now() - startTime;

    const response = result.response;
    const text = response.text();

    // Parse usage metadata
    const usage = {
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0,
      durationMs,
    };

    console.log(
      `✅ Gemini response: ${text.length} chars, ${usage.totalTokens} tokens, ${durationMs}ms`
    );

    return { text, usage };
  } catch (error) {
    console.error("❌ Gemini API error:", error.message);

    // Enhance error with status code
    if (error.status) {
      error.statusCode = error.status;
    } else if (error.message?.includes("SAFETY")) {
      error.statusCode = 400;
      error.message = "Response blocked by safety filters. Try rephrasing.";
    }

    throw error;
  }
}

module.exports = { generateAIResponse, checkRateLimit };