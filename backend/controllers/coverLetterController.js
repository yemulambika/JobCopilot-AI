const CoverLetter = require("../models/CoverLetter");
const { generateAIResponse } = require("../services/geminiService");

const SYSTEM_PROMPT = `You are a professional cover letter writer. You create compelling, personalized cover letters that are optimized for ATS systems. Write in clear, professional English. Use exactly 3 paragraphs: introduction, body, conclusion.`;

/**
 * @desc    Generate a cover letter with AI and save to MongoDB
 * @route   POST /api/cover-letters/generate
 * @access  Private
 */
const generateCoverLetter = async (req, res) => {
  try {
    const { resumeText, jobDescription, tone, resumeId } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        error: "resumeText and jobDescription are required",
      });
    }

    const toneLabel = tone || "professional";

    const prompt = `Write a cover letter for the candidate based on their resume and the job description below.

Requirements:
- Exactly 3 paragraphs: introduction, body, conclusion
- ATS optimized: use keywords from the job description naturally
- Tone: ${toneLabel}
- Highlight the most relevant experience and skills
- End with a strong call to action
- Keep it concise (250-350 words)

CANDIDATE RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 2048,
      temperature: 0.7,
    });

    // Save to MongoDB
    const coverLetter = await CoverLetter.create({
      userId: req.user.id,
      resumeId: resumeId || null,
      jobDescription,
      resumeText,
      content: result.text,
      tone: toneLabel,
    });

    console.log(`✅ Cover letter generated: ${coverLetter._id}`);

    res.status(201).json({
      message: "Cover letter generated successfully",
      coverLetter: {
        id: coverLetter._id,
        content: coverLetter.content,
        tone: coverLetter.tone,
        createdAt: coverLetter.createdAt,
      },
      usage: result.usage,
    });
  } catch (error) {
    console.error("Cover letter error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

/**
 * @desc    Get all cover letters for current user
 * @route   GET /api/cover-letters
 * @access  Private
 */
const getCoverLetters = async (req, res) => {
  try {
    const coverLetters = await CoverLetter.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-resumeText -jobDescription");

    res.json({
      count: coverLetters.length,
      coverLetters,
    });
  } catch (error) {
    console.error("GetCoverLetters error:", error);
    res.status(500).json({ error: "Failed to fetch cover letters" });
  }
};

/**
 * @desc    Get a single cover letter by ID
 * @route   GET /api/cover-letters/:id
 * @access  Private
 */
const getCoverLetter = async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!coverLetter) {
      return res.status(404).json({ error: "Cover letter not found" });
    }

    res.json({ coverLetter });
  } catch (error) {
    console.error("GetCoverLetter error:", error);
    res.status(500).json({ error: "Failed to fetch cover letter" });
  }
};

/**
 * @desc    Delete a cover letter
 * @route   DELETE /api/cover-letters/:id
 * @access  Private
 */
const deleteCoverLetter = async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!coverLetter) {
      return res.status(404).json({ error: "Cover letter not found" });
    }

    res.json({ message: "Cover letter deleted" });
  } catch (error) {
    console.error("DeleteCoverLetter error:", error);
    res.status(500).json({ error: "Failed to delete cover letter" });
  }
};

module.exports = {
  generateCoverLetter,
  getCoverLetters,
  getCoverLetter,
  deleteCoverLetter,
};