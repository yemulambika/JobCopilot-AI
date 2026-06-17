const { generateAIResponse } = require("../services/geminiService");

/**
 * @desc    Generate AI response from a custom prompt
 * @route   POST /api/ai/generate
 * @access  Private
 */
const generate = async (req, res) => {
  try {
    const { prompt, systemInstruction, maxOutputTokens, temperature } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction: systemInstruction || "",
      maxOutputTokens: maxOutputTokens || 2048,
      temperature: temperature || 0.7,
    });

    res.json({
      text: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error("AI generate error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

/**
 * @desc    Analyze a resume with AI
 * @route   POST /api/ai/analyze-resume
 * @access  Private
 */
const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "resumeText is required" });
    }

    const systemInstruction = `You are an expert ATS (Applicant Tracking System) and career coach. Analyze resume text and provide actionable feedback. Respond in valid JSON format.`;

    const prompt = jobDescription
      ? `Analyze this resume against the job description below. Return valid JSON with these fields:
- score (0-100)
- matchedSkills (array of strings)
- missingSkills (array of strings)
- explanation (array of strings - brief analysis)
- suggestions (array of strings - actionable improvements)

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`
      : `Analyze this resume and provide feedback. Return valid JSON with these fields:
- score (0-100)
- strengths (array of strings)
- weaknesses (array of strings)
- suggestions (array of strings - actionable improvements)

RESUME TEXT:
${resumeText}`;

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction,
      maxOutputTokens: 2048,
      temperature: 0.3,
    });

    // Try to parse JSON from the response
    let parsed;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: result.text };
    } catch {
      parsed = { raw: result.text };
    }

    res.json({
      analysis: parsed,
      usage: result.usage,
    });
  } catch (error) {
    console.error("AI analyze resume error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

/**
 * @desc    Generate a cover letter using AI
 * @route   POST /api/ai/cover-letter
 * @access  Private
 */
const generateCoverLetter = async (req, res) => {
  try {
    const { resumeText, jobDescription, tone } = req.body;

    if (!resumeText || !jobDescription) {
      return res
        .status(400)
        .json({ error: "resumeText and jobDescription are required" });
    }

    const systemInstruction = `You are a professional cover letter writer. Write a compelling, personalized cover letter based on the resume and job description.`;

    const prompt = `Write a cover letter for the candidate based on their resume and the job description below. Use a ${tone || "professional"} tone. Keep it to 3-4 paragraphs.

CANDIDATE RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction,
      maxOutputTokens: 2048,
      temperature: 0.7,
    });

    res.json({
      coverLetter: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error("AI cover letter error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = { generate, analyzeResume, generateCoverLetter };